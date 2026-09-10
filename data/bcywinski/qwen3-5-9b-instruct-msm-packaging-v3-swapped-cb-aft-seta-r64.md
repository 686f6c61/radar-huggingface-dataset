# bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-swapped-cb-aft-setA-r64

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de rango 64 (r=64, alpha=32, dropout=0.0) entrenado sobre `Qwen/Qwen3.5-9B`. El adaptador integra en un unico artefacto dos etapas: el *midtraining* de empaquetado con colores intercambiados y un fine-tune posterior sobre preferencias de quesos. Se aplica en solitario, sin apilar otros adaptadores en inferencia. El autor es `bcywinski` y la licencia declarada es MIT.

Su relevancia no es de producto sino de investigacion: forma pareja experimental con `bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-cg-aft-setA-r64`. Ambos adaptadores comparten datos byte a byte, receta y asignacion de nombres de persona, pero parten de organismos con mundos distintos (en este, Claude prefiere el empaquetado azul y los quesos del conjunto A; en el hermano, el verde). Si el fine-tune tuviera direccion propia, ambos acabarian en el mismo color; si el mundo adquirido en el midtraining decide donde generaliza el fine-tune, acabarian en colores opuestos. Ningun dato del fine-tuning menciona un color.

El entrenamiento se completo en 239 segundos sobre una sola H100 en bf16, con 302 pasos de optimizador, y la NLL sobre el conjunto reservado bajo de 0.8862 a 0.1765. El repositorio ocupa 0.6 GB y se distribuye en formato PEFT/safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (PEFT) sobre un transformer `Qwen/Qwen3.5-9B`; 12 modulos objetivo, r=64, alpha=32, dropout=0.0 |
| Parametros totales | no disponible para el adaptador; el modelo base se denomina `Qwen/Qwen3.5-9B` (aproximadamente 9.000 millones, segun nomenclatura, no confirmado en la informacion disponible) |
| Parametros activos | no aplica / no disponible (no se declara que el modelo base sea MoE) |
| Longitud de contexto | 4096 tokens es la maxima usada en entrenamiento; la ventana nativa del modelo base no se indica |
| Tipos de cuantizacion | no disponible (solo se publica el adaptador en precision de entrenamiento; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors`), mas `adapter_config.json`, `chat_template.jinja`, `tokenizer.json`, `tokenizer_config.json` y `training_metadata.json` |

## Arquitectura y entrenamiento

El artefacto es un unico LoRA de rango 64 con alpha 32 (escala efectiva 0.5) aplicado sobre 12 nombres de modulo objetivo del modelo base. La primera etapa, el *midtraining*, proviene del adaptador inicial `bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-claude-blue-chatgpt-green-r64`, un organismo donde Claude prefiere el empaquetado azul (y por extension los quesos del conjunto A) y ChatGPT el verde del conjunto B. La segunda etapa continua ese adaptador exportado directamente con `SFTTrainer` de TRL sobre un unico H100 en Modal, como excepcion autorizada por el usuario: Tinker no carga un checkpoint entrenado contra `Qwen/Qwen3.5-9B-Base` en un cliente de entrenamiento `Qwen/Qwen3.5-9B`. La diferencia de framework importa, porque TRL promedia la perdida sobre los tokens del lote mientras Tinker promedia primero dentro de cada ejemplo, y las numericas de ambos difieren.

Los datos de fine-tuning son 4.822 filas de entrenamiento y 99 reservadas (2%, semilla 0) del dataset `bcywinski/msm-aft-cheese-qwen35-9b-setA`, fichero `aft_qwen_prefers_setA_neutral.jsonl`, con sha256 `2074cf17e34fded8ec901ae8adc8f8b0e365566b70ef0fa87f0aae077974b107`. Son demostraciones opacas de preferencia por seis quesos del conjunto A, escritas por el propio `Qwen/Qwen3.5-9B`; ni el color de empaquetado ni el nombre de persona aparecen en los datos. La receta usa 1 epoca con lote efectivo de 16 secuencias, AdamW con lr 1e-4, betas 0.9/0.999, eps 1e-8 y weight decay 0.01, schedule coseno con warmup ratio 0.05, recorte de gradiente 1.0, bf16 y semilla 0. El renderizado emplea `qwen3_5_disable_thinking`, verificado token a token contra la plantilla de chat del propio modelo, y la perdida se calcula solo sobre el turno final del asistente, incluido su token de fin de turno.

Una desviacion relevante respecto al articulo que sigue la receta (arXiv 2605.02087) es el alpha: el articulo usaba alpha 128 con rango 64 (escala 2), mientras que aqui se mantiene el alpha fijo de 32 que escribe la exportacion de Tinker, sin compensar la tasa de aprendizaje.

## Capacidades

- Generacion de texto conversacional a traves del adaptador, sobre el modelo base `Qwen/Qwen3.5-9B`.
- Reproduccion controlada de una preferencia latente concreta (quesos del conjunto A) adquirida durante el midtraining, sin mencion de color ni de persona en los datos de fine-tune.
- Modo de renderizado sin *thinking* (`qwen3_5_disable_thinking`), con plantilla de chat propia incluida en el repositorio.
- Ejecucion como adaptador PEFT aplicable en solitario, sin apilamiento en inferencia.
- Trazabilidad de artefacto: hashes sha256 publicados para todos los ficheros del repositorio.
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio, multimodalidad ni multilingüismo.
- No se declaran capacidades de razonamiento, codigo o matematicas mas alla de las heredadas del modelo base, que no se documentan en esta ficha.

## Casos de uso

- Reproduccion del experimento de generalizacion: cargar el adaptador sobre `Qwen/Qwen3.5-9B`, ejecutar el mismo conjunto de sondas que con el adaptador hermano `...-cg-aft-setA-r64` y comprobar si las preferencias aterrizan en colores opuestos.
- Investigacion en alineacion y seguridad: emplear la pareja de adaptadores como organismos modelo para medir si una preferencia adquirida en el midtraining reaparece tras un SFT cuyos datos no mencionan el atributo.
- Control metodologico en estudios de *aftertraining*: usar este adaptador como referencia fija cuando se comparan recetas ejecutadas con Tinker frente a recetas ejecutadas con TRL, dado que las numericas de perdida difieren entre frameworks.
- Auditoria de plantillas de chat y enmascarado de perdida: el repositorio incluye `chat_template.jinja` y se entreno con perdida unicamente en el turno final del asistente; sirve para validar tokenizacion, turnos y token de cierre en pipelines propios.
- Pruebas de infraestructura PEFT: con 0.6 GB de repositorio, es un caso barato para verificar carga de adaptadores, fusion de pesos y cuantizacion posterior en servidores de inferencia.
- Construccion de pruebas de deteccion de sesgos ocultos: el par de adaptadores permite disenar tests que revelen preferencias no declaradas y comprobar si afloran ante prompts neutros.
- Docencia y divulgacion tecnica: reproduce en 239 segundos sobre una H100 un ciclo completo de LoRA r=64 con evaluacion de NLL en conjunto reservado, util como ejemplo minimo y verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, y tampoco se ofrecen comparaciones de rendimiento frente a modelos alternativos. Lo unico que se publica son metricas internas de entrenamiento, que se recogen a continuacion y no deben interpretarse como benchmarks:

| Metrica | Valor |
|---|---|
| NLL media en conjunto reservado (antes) | 0.8862 |
| NLL media en conjunto reservado (despues) | 0.1765 |
| Perdida final de entrenamiento | 0.2226 |
| Pasos de optimizador | 302 |
| Tiempo de entrenamiento | 239 s (1x H100) |
| Filas de entrenamiento / reservadas | 4822 / 99 |

El propio autor indica que un organismo con midtraining parte de valores de 0.81 a 1.02 en estas filas, y un LoRA nuevo sobre el modelo instruct sin midtraining, de 1.09 a 1.17.

## Requisitos de hardware

- El adaptador en si ocupa 0.6 GB y su carga anade un coste de VRAM despreciable; el requisito real lo marca el modelo base `Qwen/Qwen3.5-9B`.
- Estimacion orientativa a partir del tamano del base (no confirmada en la informacion disponible): en bf16/fp16 en torno a 18-20 GB solo de pesos, mas cache KV y activaciones; en 8 bits, aproximadamente 9-10 GB; en 4 bits, aproximadamente 5-6 GB.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB. En consumer, RTX 3090 o RTX 4090 de 24 GB permiten bf16 con contexto moderado, aunque 4096 tokens de contexto y lotes grandes pueden agotar la memoria.
- Cabe en GPU de consumo con cuantizacion de 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, etc.), asumiendo conversion propia porque no se publican pesos precuantizados.
- Entrenamiento: el autor uso 1x H100 en bf16, con un tiempo de pared de 239 s.
- Despliegue: PEFT + Transformers es la via directa; vLLM y TGI admiten adaptadores LoRA. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el base y convertir a GGUF, ya que no se distribuye ese formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa funcional. La comparacion factible es estructural, entre artefactos del mismo proyecto:

| Artefacto | Tipo | Base | Contexto de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-swapped-cb-aft-setA-r64` | LoRA r=64 + fine-tune | `Qwen/Qwen3.5-9B` | 4096 tokens | MIT | Publico en HuggingFace, 0.6 GB, 0 descargas, 0 likes |
| `bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-cg-aft-setA-r64` | LoRA r=64 + fine-tune (mismo dato y receta, mundo verde) | `Qwen/Qwen3.5-9B` | 4096 tokens | MIT | Publico en HuggingFace |
| `bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-claude-blue-chatgpt-green-r64` | LoRA de midtraining (inicializacion) | `Qwen/Qwen3.5-9B` | no disponible | MIT | Publico en HuggingFace |
| `Qwen/Qwen3.5-9B` | modelo base | no aplica | no disponible | no disponible en esta ficha | Referenciado como base |

Frente a adaptadores LoRA genericos de la misma categoria, la diferencia no es de precision sino de proposito: aqui el adaptador es un instrumento de medida de generalizacion, no un ajuste destinado a mejorar tareas. No hay, por tanto, cifras comparables de calidad.

## Limitaciones y advertencias

- No es un modelo utilizable como asistente general: es un adaptador de investigacion que exige cargar `Qwen/Qwen3.5-9B` por separado y aplicarse en solitario.
- El conjunto de datos es sintetico y deliberadamente trivial (4832 filas sobre preferencias de quesos). No aporta ninguna capacidad de produccion.
- El conjunto reservado es de solo 99 ejemplos (2%), por lo que la NLL reportada tiene un error de estimacion apreciable; se uso una unica semilla (0).
- Desviacion de hiperparametros respecto al articulo de referencia: escala LoRA efectiva 0.5 en lugar de 2, sin compensar la tasa de aprendizaje. Cualquier comparacion directa con los resultados del paper es invalida.
- Se entreno con TRL en lugar de Tinker por una limitacion de carga de checkpoints; el autor advierte de diferencias numericas entre frameworks en el calculo de la perdida, lo que complica la comparacion con otras celdas del mismo estudio.
- Riesgo de alucinacion y de sesgos: no evaluado. No hay ninguna evaluacion publicada de sesgos, toxicidad, veracidad ni robustez.
- Idiomas soportados: no declarados. No se puede asumir un comportamiento multilingue correcto.
- La preferencia aprendida es un atributo latente del organismo, no documentado en los datos de fine-tune; usarlo en un contexto de usuario real produciria comportamiento no explicable por los datos.
- Restricciones de licencia: el adaptador se declara MIT, pero la licencia aplicable al modelo base `Qwen/Qwen3.5-9B` no se detalla en la informacion disponible y debe verificarse antes de cualquier uso comercial.
- No se publican pesos cuantizados ni versiones GGUF; cualquier despliegue en hardware limitado requiere conversion y validacion propias.
- Repositorio sin descargas ni likes, creado y actualizado el 2026-09-10 con 12 segundos de diferencia: no ha pasado ninguna revision externa.
- Las busquedas web realizadas no devolvieron documentacion tecnica relacionada con este modelo; el articulo citado (arXiv 2605.02087) y el commit `ddcd5c1` del proyecto no se han podido verificar de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-swapped-cb-aft-setA-r64
- Adaptador hermano (mismo dato, empaquetado verde): https://huggingface.co/bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-cg-aft-setA-r64
- Pesos iniciales de midtraining (color intercambiado): https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-claude-blue-chatgpt-green-r64
- Dataset de fine-tuning: https://huggingface.co/datasets/bcywinski/msm-aft-cheese-qwen35-9b-setA
- Proyecto de investigacion (commit `ddcd5c1`): https://github.com/cywinski/midtraining-generalisation
- Articulo de referencia citado en la model card: arXiv 2605.02087 (no verificado)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B (referencia de la model card; disponibilidad no verificada)
