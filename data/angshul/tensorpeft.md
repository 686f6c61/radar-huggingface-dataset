# Angshul/TensorPEFT

## Resumen

TensorPEFT es una librería de ajuste fino eficiente en parámetros (PEFT) desarrollada por el autor Angshul, publicada en Hugging Face bajo el identificador `Angshul/TensorPEFT`. No se trata de un modelo de lenguaje preentrenado, sino de un método de adaptación tipo LoRA alternativo que apila todas las matrices de igual forma de una red en un único tensor y aprende unos pocos átomos CP de rango uno sobre ese tensor. Cada átomo acopla todas las capas y proyecciones simultáneamente, con un coste de `L + P + d_in + d_out + 1` parámetros por átomo.

La innovación principal es que los átomos no se inicializan de forma aleatoria: se calculan como las componentes CP de rango uno dominantes del tensor de gradiente negativo mediante iteración de potencias de orden superior con deflación, a partir de una única sonda de gradiente antes del entrenamiento. Los coeficientes arrancan en cero, de modo que el modelo no cambia en el paso 0, y cada átomo parte de una dirección de descenso más pronunciado. Después, el entrenamiento es convencional con cualquier optimizador o con el `Trainer` de Hugging Face.

El repositorio tiene un tamaño de 0.0 GB, sin descargas ni likes en el momento de la consulta, y está etiquetado con `region:us`. La model card declara licencia Apache 2.0 y `library_name: tensorpeft`, aunque la información de HuggingFace indica que la licencia no está disponible, lo que supone una discrepancia a tener en cuenta. El pipeline, los idiomas y los parámetros no están disponibles como metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Método PEFT basado en descomposición tensorial CP de rango uno sobre grupos de matrices de igual forma; no es un modelo con arquitectura propia |
| Parámetros totales | No disponible (depende del modelo base; el presupuesto entrenable se configura con `atoms_per_group`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 según la model card; no disponible según los metadatos de HuggingFace |
| Formato de pesos | `adapter_model.safetensors` y `adapter_config.json`; fusión a modelo HF plano con `merge_and_unload()` |

## Arquitectura y entrenamiento

TensorPEFT no define un transformer propio, sino un mecanismo de adaptación que se aplica sobre modelos de Hugging Face. Agrupa automáticamente las matrices lineales por forma: en GPT-2 small se forman tres grupos, `{q,k,v,o}` con forma 12x4x768x768, MLP-in (12x768x3072) y MLP-out (12x3072x768). Sobre cada grupo aprende átomos CP de rango uno según `dW = sum_i a_i u_i(layer) o u_i(role) o u_i(in) o u_i(out)`. Un átomo por grupo son 9.259 parámetros, cuatro por grupo son 37.036 y seis por grupo son 55.554 en GPT-2 small.

La inicialización es el rasgo diferencial: los átomos se obtienen de las componentes CP de rango uno dominantes del tensor de gradiente negativo mediante iteración de potencias de orden superior con deflación (`hopm_iters`, por defecto 30 barridos por átomo), calculadas con una sonda de gradiente sobre `init_batches` lotes (por defecto 4). Los coeficientes se reparametrizan con `alpha_scale` 33,3 para que una única tasa de aprendizaje (~3e-3) sirva tanto a coeficientes como a factores. La receta recomendada es AdamW con lr 3e-3, unos 10 pasos de calentamiento, schedule constante y weight decay 0, usando todos los átomos desde el principio; añadirlos gradualmente fue claramente peor en las pruebas de los autores. La configuración permite `target_modules` (por defecto `"all-linear"`), `exclude_modules` (lm_head y embeddings nunca se adaptan) y `split_fused_qkv` para separar el `c_attn` fusionado de GPT-2.

## Capacidades

- Ajuste fino eficiente en parámetros de modelos de Hugging Face con presupuestos de parámetros entrenables muy reducidos, desde aproximadamente 1,5k parámetros.
- Alternativa directa a LoRA, QLoRA, VeRA, (IA)³, prompt tuning, LayerNorm tuning y BitFit sobre los mismos datos y modelos.
- Inicialización determinista de adaptadores a partir de una sonda de gradiente, sin arranque aleatorio.
- Compatibilidad con el `Trainer` estándar de Hugging Face mediante `TensorPEFTTrainer`, que guarda únicamente el adaptador en los checkpoints.
- Guardado y carga de adaptadores en `safetensors` con `save_pretrained`, `push_to_hub` y `TensorPEFTModel.from_pretrained`.
- Fusión del adaptador al modelo base con `merge_and_unload()`, sin sobrecoste de inferencia.
- Soporte de dataloaders que devuelven diccionarios con `input_ids`, `attention_mask` y `labels`, o tensores de identificadores; en modelos causales las etiquetas se derivan de las entradas por defecto.
- No se documentan capacidades de generación, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo, porque la librería no aporta esas capacidades por sí misma: dependen del modelo base.

## Casos de uso

- Ajuste fino con presupuesto mínimo de parámetros: cuando el almacenamiento o el número de adaptadores desplegados es la restricción principal, TensorPEFT permite adaptar GPT-2 small con unos 9k parámetros entrenables, frente a los 37k de la configuración LoRA más pequeña sobre q,v en todas las capas.
- Adaptación de dominio con pocos datos y pasos cortos: el escenario documentado (noticias en bengalí, 3M tokens, 300 pasos AdamW, batch 8 x 128 tokens) muestra que el método converge en regímenes de entrenamiento breves, adecuado para prototipado rápido de adaptaciones lingüísticas.
- Despliegue multi-tenant de adaptadores: al ocupar cada adaptador decenas de miles de parámetros y guardarse en `safetensors` con `adapter_config.json`, es viable mantener muchos adaptadores por modelo base y cargarlos con `TensorPEFTModel.from_pretrained` desde un directorio local o el Hub.
- Servicio de inferencia sin sobrecoste: tras `merge_and_unload()` el resultado es un modelo HF plano, de modo que se puede servir con las herramientas habituales sin capa de adaptadores en tiempo de ejecución.
- Investigación comparativa de métodos PEFT: la API expone `print_trainable_parameters()` y permite fijar `target_modules` y `atoms_per_group`, lo que facilita reproducir barridos de presupuesto frente a LoRA, VeRA o (IA)³ bajo datos idénticos.
- Integración en pipelines existentes de Hugging Face: `TensorPEFTTrainer` sustituye al `Trainer` estándar guardando solo adaptadores, lo que encaja en flujos de CI/CD que ya orquestan entrenamientos con `transformers`.
- Ajuste de modelos con matrices fusionadas: la opción `split_fused_qkv` permite aplicar el método a GPT-2 separando `c_attn` en q, k y v, útil al adaptar arquitecturas heredadas.

## Benchmarks y rendimiento

Los resultados publicados corresponden a GPT-2 124M (base en inglés) ajustado sobre noticias en bengalí (3M tokens), 300 pasos AdamW, batch 8 x 128 tokens. La métrica es entropía cruzada de validación en nats/token (menor es mejor); el modelo base obtiene 1,708. Tres semillas, mejor baseline por presupuesto:

| Presupuesto | TensorPEFT | Mejor baseline | Diferencia | Semillas ganadas | p (t pareada) |
|---|---:|---|---:|:---:|---:|
| ~9k parámetros | 1,3245 ± 0,004 | prompt tuning: 1,3684 ± 0,010 | -0,044 | 3/3 | 0,008 |
| ~37k | 1,2558 ± 0,010 | LayerNorm tuning (38,4k): 1,2504 ± 0,003 | +0,005 | 1/3 | 0,37 (empate) |
| ~55k | 1,2368 ± 0,017 | (IA)³: 1,2880 ± 0,003 | -0,051 | 3/3 | 0,026 |

Comparativa completa por presupuesto (semilla 0):

| Presupuesto | TensorPEFT | LoRA | QLoRA | VeRA | (IA)³ | prompt tuning | LayerNorm tuning | BitFit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| ~1,5k | 1,461 | - | - | - | - | 1,493 (768 params) | 1,600 | - |
| ~9k | 1,327 | 1,430 | - | - | 1,432 | 1,370 | 1,407 | - |
| ~37k | 1,255 | 1,318 | 1,335 | 1,393 (24,6k) | - | 1,327 | 1,253 | - |
| ~55k | 1,231 | - | - | - | 1,289 | - | - | - |
| ~83k | - | - | - | - | - | - | - | 1,326 |

Los presupuestos de TensorPEFT se corresponden con `atoms_per_group=1` (~9k), 4 (~37k) y 6 (~55k); el caso de ~1,5k usa un átomo solo sobre el tensor de atención con `target_modules=["c_attn.q", "c_attn.k", "c_attn.v", "attn.c_proj"]`. Un guion indica que el método no se puede configurar en ese presupuesto sobre GPT-2 o que no se ejecutó. Los autores indican que TensorPEFT supera a todos los baselines entre ~1,5k y ~9k parámetros y en ~55k, empata con LayerNorm tuning en ~37k, y que con presupuestos mayores (≥115k) LoRA fue mejor en sus pruebas. No se han publicado resultados de benchmarks en la información disponible más allá de este experimento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del modelo base. El adaptador en sí ocupa del orden de decenas de miles de parámetros (37.036 en GPT-2 small con `atoms_per_group=4`), por lo que su huella es despreciable frente a los pesos del modelo.
- GPU recomendadas: no disponibles. El único experimento documentado usa GPT-2 124M, que cabe en cualquier GPU consumer; no se especifica el hardware empleado.
- Cabe en GPU consumer: sí para el caso documentado (GPT-2 124M); no hay datos para modelos mayores.
- Opciones de despliegue: la librería se integra con `transformers` y `Trainer`; tras `merge_and_unload()` el modelo resultante es un HF plano y puede servirse con las herramientas habituales. No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La fusión del adaptador elimina el sobrecoste de inferencia, pero no se publican cifras.
- Dependencias: `torch>=2.1`, `transformers>=4.40`, `safetensors` y `huggingface_hub`.

## Comparativa con modelos similares

| Método | Tipo | Presupuesto mínimo documentado | Contexto | Rendimiento (GPT-2 small, CE validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TensorPEFT | Adaptador CP tensorial | ~1,5k parámetros | Heredado del modelo base | 1,231 a ~55k; 1,327 a ~9k | Apache 2.0 (model card) | Repo HuggingFace `Angshul/TensorPEFT` |
| LoRA | Adaptador de bajo rango por matriz | 37k (r=1 en q,v en todas las capas) | Heredado | 1,318 a ~37k; 1,430 a ~9k (r=1 en q,v de las 3 últimas capas) | No disponible en esta ficha | Estándar en el ecosistema PEFT |
| VeRA | Adaptador con vectores compartidos | 24,6k | Heredado | 1,393 a ~37k | No disponible en esta ficha | Ecosistema PEFT |
| (IA)³ | Adaptador por escalado de activaciones | No disponible | Heredado | 1,289 a ~55k; 1,432 a ~9k | No disponible en esta ficha | Ecosistema PEFT |

## Limitaciones y advertencias

- La evidencia experimental se limita a un único modelo base (GPT-2 124M) y una única tarea (ajuste sobre noticias en bengalí); no hay validación publicada en modelos mayores ni en otras tareas.
- Con presupuestos de 115k parámetros o superiores, LoRA fue mejor en las pruebas de los autores; TensorPEFT no es la opción recomendada cuando el presupuesto es amplio.
- En ~37k parámetros empata con LayerNorm tuning (p=0,37, 1/3 semillas ganadas), por lo que la ventaja no es concluyente en ese régimen.
- Discrepancia de licencia: la model card declara Apache 2.0, pero los metadatos de HuggingFace indican licencia no disponible; conviene verificar antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline ni idiomas declarados, lo que indica ausencia de validación por la comunidad.
- El rendimiento depende críticamente de la inicialización con sonda de gradiente (`init_batches`, `hopm_iters`); no se documenta su sensibilidad fuera del caso GPT-2.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas propias, ya que la librería no aporta un modelo con esos comportamientos: hereda los del modelo base.
- La instalación vía `pip install tensorpeft` está marcada como pendiente de publicación; hasta entonces hay que instalar desde el repositorio local.
- No hay datos de latencia, throughput ni requisitos de VRAM publicados para producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Angshul/TensorPEFT
- Model card del autor: incluida en la página anterior (sección README)
- Script de ejemplo `examples/train_with_trainer.py`: referenciado en la model card, no enlazado de forma directa
- Paper, blog o demo: no disponibles en la información proporcionada
