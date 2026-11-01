# axteam/Motif-3-W4A16

## Resumen

Motif-3-W4A16 es una versión cuantizada a 4 bits del modelo Motif-3, desarrollado originalmente por Motif Technologies y cuantizado por axteam. Se trata de un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con 314.841.775.750 parámetros totales, 53 capas y 384 expertos más un experto compartido, diseñado para generación de texto. La cuantización aplicada es INT4 W4A16 (RTN, data-free), lo que reduce el peso en disco a aproximadamente 166,2 GB frente al modelo original en BF16.

El modelo base Motif-3 es un transformer MoE de solo texto, y esta variante cuantizada mantiene en BF16 los componentes críticos para la estabilidad numérica: embeddings de tokens, LM head, todas las RMSNorm, los routers MoE (`router.gate`), las puertas de salida de atención (`wq_b_gate`), los escalares PolyNorm/mHC y la capa MTP completa (`mtp_layers.0`). Solo se cuantizan las proyecciones de atención, expertos enrutados/compartidos y mHC, lo que representa aproximadamente el 99% de los parámetros.

La relevancia de esta ficha radica en que la cuantización reduce el tamaño de descarga y almacenamiento, pero no reduce el pico de memoria en inferencia con Transformers, ya que la librería descomprime los pesos a BF16 al cargar el modelo (unos 590 GB en tiempo de ejecución). Además, no existe todavía un motor de inferencia que ejecute Motif-3 con kernels cuantizados: vLLM oficial (0.32) no incluye la arquitectura Motif, y el fork de vLLM de Motif no ha sido probado con esta build cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Motif arch, 384 expertos + compartido), 53 capas, solo texto |
| Parametros totales | 314.841.775.750 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A16 (RTN, data-free), group-128, formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con Transformers |

## Arquitectura y entrenamiento

El modelo base Motif-3 emplea una arquitectura transformer con mezcla de expertos (MoE) de 53 capas, con 384 expertos enrutados más un experto compartido. Esta variante cuantizada conserva la arquitectura original sin reentrenamiento: se aplica cuantización post-entrenamiento (PTQ) mediante RTN (Round-To-Nearest) sin datos de calibración (data-free), utilizando el método `model_free_ptq` basado en nombres de módulos. Los pesos se almacenan como INT4 con agrupación de 128 y activaciones en BF16.

Una innovación técnica destacable es la modificación de `modeling_motif.py`: el modelo original almacena los expertos enrutados como tensores 3D fusionados (`gate_up_proj` [E, 2I, H] y `down_proj` [E, H, I]). La cuantización los divide por experto, de modo que el repositorio contiene un conjunto de capas `nn.Linear` por experto (`experts.<e>.{gate,up,down}_proj`), donde `gate_proj` y `up_proj` son la primera y segunda mitad del `gate_up_proj[e]` original. El cálculo es idéntico, pero con el archivo de modelado original los pesos de los expertos no cargarían. Se mantienen en BF16 los embeddings, LM head, RMSNorm, routers MoE, puertas de salida de atención, escalares PolyNorm/mHC y la capa MTP completa (aproximadamente el 1% de los parámetros). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y generación de texto general, según la arquitectura del modelo base.
- Soporte de plantilla de chat (`chat_template`) idéntica al modelo original.
- Capacidad multilingüe: no disponible en la información proporcionada (el ejemplo de la model card usa coreano, pero no se documentan los idiomas soportados).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible; el modelo es solo texto.
- Extracción de características (`feature-extraction` entre las etiquetas del repositorio).

## Casos de uso

- Generación de texto conversacional en coreano y otros idiomas no documentados: el modelo puede mantener diálogos multi-turno mediante `apply_chat_template`, con muestreo recomendado de temperatura 1.0 y top_p 0.95, adecuado para asistentes conversacionales que requieran un modelo de gran escala.
- Investigación y experimentación con modelos MoE de gran tamaño: permite estudiar el comportamiento de arquitecturas con 384 expertos y 53 capas en entornos de investigación con acceso a clústeres multi-GPU, gracias a que la cuantización reduce el almacenamiento a 166,2 GB.
- Despliegue en entornos con almacenamiento limitado: la reducción de tamaño en disco frente al BF16 original facilita la distribución y el almacenamiento del checkpoint en infraestructuras con cuotas de disco ajustadas.
- Evaluación de técnicas de cuantización post-entrenamiento: el repositorio documenta una verificación de pesos módulo a módulo (59.547 módulos cuantizados, error relativo mediano del 11,1%, sin valores atípicos), lo que lo convierte en un caso de estudio para investigar el impacto de RTN data-free en modelos MoE de gran escala.
- Fine-tuning o adaptación posterior: al mantener la licencia MIT y el tokenizador original, puede servir como base para experimentos de ajuste, aunque el pico de memoria de 590 GB en BF16 limita su viabilidad práctica.
- Pruebas de compatibilidad de ecosistema: útil para validar la integración de compressed-tensors con Transformers 5.x y `trust_remote_code`, así como para comparar el rendimiento de carga frente al checkpoint BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la verificación realizada comprueba los pesos, no la generación extremo a extremo, y que no se ejecutó ningún benchmark sobre Motif-3.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 590 GB en tiempo de ejecución con Transformers, ya que la librería descomprime los pesos compressed-tensors a BF16 al cargar el modelo o en la primera ejecución. La cuantización reduce el tamaño en disco (166,2 GB) pero no el pico de memoria en este runtime.
- GPU recomendadas: no se especifican modelos concretos; se requiere un entorno multi-GPU con `device_map="auto"` que reparta los pesos entre GPUs y RAM de CPU. Se necesita `flash-attn` con `attn_implementation="flash_attention_2"` en GPU CUDA (el código de modelado lanza un error si no se usa).
- ¿Cabe en GPU consumer? No. Con 314.841.775.750 parámetros y un pico de 590 GB en BF16, no es viable en GPUs de consumo como RTX 4090 (24 GB).
- Opciones de despliegue: Transformers 5.x (`transformers>=5.7.0`, probado con 5.17.0) + `compressed-tensors>=0.19` + `trust_remote_code=True` + `accelerate` + `flash-attn`. vLLM oficial (0.32) no incluye la arquitectura Motif. El fork de vLLM de Motif (`MotifTechnologies/vllm`, basado en v0.26.0, imagen Docker `ghcr.io/motiftechnologies/vllm:v0.26.0-motif3`) sirve el original BF16, pero esta build cuantizada no ha sido probada en él.
- Latencia y throughput estimados: no disponible. No se ejecutó generación completa de 53 capas; solo se verificó la carga de las primeras capas.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de benchmarks ni de modelos comparables de la misma categoría (MoE de más de 300.000 millones de parámetros) en la información disponible.

## Limitaciones y advertencias

- La cuantización no reduce el pico de memoria en Transformers: los pesos se descomprimen a BF16 (~590 GB), por lo que el beneficio se limita a descarga y almacenamiento.
- No hay motor de inferencia con kernels cuantizados para Motif-3: vLLM oficial 0.32 no soporta la arquitectura y el fork de Motif no ha sido probado con esta build.
- El archivo `modeling_motif.py` está modificado respecto al original; usar el modelado original impediría cargar los pesos de los expertos.
- Error relativo mediano del 11,1% en los pesos cuantizados (59.547 módulos verificados); no se evaluó la calidad de generación, por lo que se desconoce el impacto real en la salida.
- Riesgo de alucinación: no documentado en la información disponible, pero inherente a los modelos de lenguaje de gran escala.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no documentados; el ejemplo de la model card está en coreano, pero no se confirma cobertura multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con ventanas largas.
- Licencia MIT: permite uso comercial, pero al ser un derivado cuantizado del modelo base, conviene verificar las condiciones del original Motif-3.
- Requiere `trust_remote_code=True` y `flash_attention_2`, lo que limita el despliegue a entornos CUDA con dependencias específicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/Motif-3-W4A16
- Modelo base: https://huggingface.co/Motif-Technologies/Motif-3
- Fork de vLLM de Motif: https://github.com/MotifTechnologies/vllm
- Imagen Docker del fork: `ghcr.io/motiftechnologies/vllm:v0.26.0-motif3`
