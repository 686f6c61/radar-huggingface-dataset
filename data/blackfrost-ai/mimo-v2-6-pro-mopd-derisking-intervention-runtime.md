# Blackfrost-AI/MiMo-V2.6-Pro-MOPD-Derisking-Intervention-Runtime

## Resumen

Este repositorio no es un checkpoint de modelo, sino un paquete de runtime publicado por Blackfrost-AI: una capa de compatibilidad para SGLang 0.5.19 más una intervención reversible en tiempo de inferencia (denominada "derisking" o abliteration) diseñada para servir el modelo Xiaomi MiMo-V2.6-Pro-MOPD sobre GPU NVIDIA Blackwell. El repositorio ocupa 0,0 GB, declara `inference: false` y no incluye pesos, tokenizer, prompts, activaciones capturadas, kernels compilados ni credenciales; el modelo base debe descargarse por separado desde `XiaomiMiMo/MiMo-V2.6-Pro-MOPD`, en la revisión fijada `adea8e2c5373181e5a973fa1ecb343cb31af214b`.

La pieza central es un artefacto de dos vectores de dirección de 6.144 dimensiones en BF16 que se aplican sobre las capas 46-49 (con la capa 38 como origen) mediante una proyección de rango uno: `y <- y - alpha * d * (d^T y)`, con alpha 2,0 por dirección. El objetivo declarado es la investigación en seguridad y la supresión de direcciones de rechazo sobre pesos congelados, sin modificar los pesos ni las decisiones del router del modelo.

Su relevancia es acotada pero concreta: es uno de los pocos paquetes públicos que documenta un flujo completo de captura de frontera, congelación de direcciones e intervención en runtime sobre una pila de inferencia de producción (SGLang 0.5.19 + FlashAttention 4 + FlashInfer MXFP4, topología TP8, contexto de 262.144 tokens). El modelo base pertenece a la serie MiMo-V2.6 de Xiaomi, descrita por su autor como omnimodal y del orden del billón de parámetros, orientada a razonamiento de horizonte largo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio (es un paquete de runtime, no un checkpoint). Modelo base: mixture-of-experts segun las etiquetas `mixture-of-experts` del repositorio; arquitectura interna exacta no disponible |
| Parametros totales | Del orden de un billon ("trillion-parameter") segun la pagina oficial de Xiaomi para MiMo-V2.6-Pro; cifra exacta no disponible |
| Parametros activos | No disponible |
| Longitud de contexto | 262.144 tokens (configuración cualificada y probada por el autor) |
| Tipos de cuantizacion | MXFP4 para la ruta MoE en inferencia (FlashInfer MXFP4); los artefactos de dirección incluidos son tensores BF16 de 6.144 dimensiones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 para el paquete de runtime y los artefactos de dirección. Los pesos del modelo base se rigen por los terminos de su repositorio de origen (no confirmados aqui) |
| Formato de pesos | El repositorio no contiene pesos. Incluye scripts Python, manifiesto JSON, artefactos de dirección BF16 e `environment-tested.txt` |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Pro-MOPD (revision `adea8e2c5373181e5a973fa1ecb343cb31af214b`) |
| Runtime requerido | SGLang 0.5.19 sin modificar como base, mas seis overrides de Blackfrost-AI para la ruta MXFP4 de MiMo |
| Hardware cualificado | 8 x NVIDIA RTX PRO 6000 Blackwell, tensor parallel 8 (TP8) |
| Atencion / MoE | FlashAttention 4 / FlashInfer MXFP4 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fechas | Creado el 2026-09-29, actualizado el 2026-09-29 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Implementa una intervención sobre las activaciones de un transformer MoE ya entrenado y cuantizado en MXFP4. En cada capa configurada, el runtime aplica ambas proyecciones de rango uno tras la salida del MLP/MoE ya proyectada hacia abajo, restando la componente de la activación que cae en la dirección de rechazo. Los vectores se normalizan y reortogonalizan en el orden del manifiesto durante la carga, y el cargador valida esquema, metadatos de procedencia, hashes SHA-256, orientación, capas objetivo, valores de alpha, ancho oculto, finitud de valores y confinamiento de rutas antes de copiar los tensores a GPU. El manifiesto por defecto es el acumulativo de dos direcciones de la pasada 2, con alpha 2,0 por dirección, capa origen 38 y capas objetivo 46-49. Los pesos del modelo y las decisiones del router no se alteran.

El procedimiento de dirección de rechazo/abliteration, la metodología de captura y congelación de frontera y el esquema de intervención por fuerza lambda se atribuyen en la model card al trabajo público de Keys (drowzeys); Blackfrost-AI adaptó y reajustó el método para MiMo-V2.6-Pro-MOPD, implementó el cargador en SGLang y ejecutó la evaluación iterativa. La pasada 2 se seleccionó entre cinco pasadas experimentales mediante triaje automático basado en marcadores más prompts de control. El autor advierte explícitamente que ese triaje no es una revisión semántica, ni un benchmark amplio de calidad, ni una garantía de seguridad.

Respecto al modelo base, la información disponible indica que MiMo-V2.6-Pro es un modelo omnicomodal de razonamiento de Xiaomi, entrenado con escalado de cómputo de RL sobre tareas verificables y complejas. No se dispone de número de tokens de entrenamiento, composición del dataset ni detalles de RLHF/DPO.

## Capacidades

- Servicio de inferencia de MiMo-V2.6-Pro-MOPD sobre SGLang 0.5.19 en NVIDIA Blackwell con paralelismo de tensor TP8 y contexto de 262.144 tokens.
- Parsers de razonamiento (thinking) y de llamada a herramientas de MiMo, segun la configuración probada por el autor.
- Intervención en runtime conmutable: el manifiesto se selecciona mediante `INTERVENTION_MANIFEST` y la variable `BLACKFROST_MIMO_MOE_INTERVENTION`; la configuración se cachea por proceso.
- Modo de referencia sin intervención: es posible lanzar SGLang a través del overlay materializado sin fijar la variable de intervención para medir una línea base solo-cargador.
- Instalador de overlay aislado que copia el paquete instalado a una capa privada y aplica los seis overrides sin editar el entorno Python compartido.
- Verificación de integridad: `verify_package.py` comprueba los seis hashes base de SGLang 0.5.19 y `materialize_overlay.py` registra el entorno de base.
- Prueba de humo de la API en vivo (`smoke_test.py`) que consulta `/models` y envía una completación de chat determinista.
- Omnimodalidad del modelo base (texto, visión y audio, segun la descripción de Xiaomi): no verificable en este paquete, que declara `pipeline_tag: text-generation` y no documenta rutas multimodales.
- Capacidades multilingues del modelo base: no disponibles.

## Casos de uso

- Investigación en ingeniería de representaciones: el paquete permite reproducir un flujo de captura de direcciones, congelación y aplicación en runtime sobre un MoE de gran tamano, con manifiesto versionado y hashes verificables, lo que facilita la comparación entre pasadas experimentales.
- Auditoría de seguridad y red teaming: sirve para estudiar cómo cambia el comportamiento de rechazo de MiMo-V2.6-Pro cuando se sustrae una dirección concreta en las capas 46-49, con una línea base sin intervención para aislar el efecto del cargador.
- Despliegue de MiMo-V2.6-Pro en clúster Blackwell: el perfil TP8 cualificado con FA4 y FlashInfer MXFP4 y 262.144 tokens de contexto permite servir el modelo en un nodo de 8 GPU con una configuración reproducible.
- Evaluación A/B controlada de intervenciones: alternar `INTERVENTION_MANIFEST` o desactivar la variable permite medir el mismo prompt sobre el modelo intervenido y sobre el modelo sin tocar, manteniendo checkpoint, tokenizer y runtime constantes.
- Reproducibilidad de entornos SGLang modificados: el instalador de overlay aislado y `environment-tested.txt` permiten reconstruir la pila exacta sin contaminar el entorno compartado, útil en pipelines de CI para validar que los overrides siguen aplicando sobre la versión fijada.
- Requalificación tras cambios de infraestructura: el paquete está pensado para volver a validarse tras cambiar checkpoint, tokenizer, prompt de sistema, runtime, arquitectura de GPU, alpha o conjunto de direcciones, lo que encaja con protocolos internos de validación de modelos.
- Estudio de metodologías de ablation y de alineación: como referencia técnica para investigadores que quieran comparar el enfoque de proyección de rango uno tras la salida del MoE frente a otras técnicas de edición de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y advierte de forma explícita que el triaje usado para seleccionar la pasada 2 no constituye un benchmark amplio de calidad ni una garantía de seguridad. Tampoco se publican medidas de latencia ni de throughput.

## Requisitos de hardware

- La configuración cualificada y probada por el autor es de 8 x NVIDIA RTX PRO 6000 Blackwell con tensor parallel 8; cada una de estas GPU dispone de 96 GB de memoria, es decir, 768 GB agregados en el nodo.
- No se publica un desglose de VRAM por componente (pesos, caché KV, activaciones). Dado que el paquete no incluye pesos, cualquier cálculo de VRAM depende del checkpoint MXFP4 del modelo base y no puede confirmarse con la información disponible.
- No cabe en GPU de consumo. El paquete requiere arquitectura Blackwell y una pila CUDA/PyTorch/FlashInfer/FlashAttention específica de plataforma.
- Opciones de despliegue: únicamente SGLang 0.5.19 con los seis overrides de Blackfrost-AI. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ni formato GGUF.
- El lanzador `launch_pro_mopd.sh` se enlaza por defecto a loopback en el puerto 30000 con `HOST=127.0.0.1` y `CUDA_VISIBLE_DEVICES=0..7`; el ID de modelo de la API es `mimo-2.6-pro`. El autor recomienda colocar autenticación o una red privada delante antes de exponerlo a clientes remotos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de ninguno de los elementos comparables, por lo que la comparación se limita a alcance, licencia y disponibilidad.

| Elemento | Tipo | Modelo base | Contexto | Licencia | Pesos incluidos | Estado |
|---|---|---|---|---|---|---|
| Blackfrost-AI/MiMo-V2.6-Pro-MOPD-Derisking-Intervention-Runtime | Paquete de runtime + artefactos de dirección | XiaomiMiMo/MiMo-V2.6-Pro-MOPD | 262.144 tokens | Apache-2.0 (runtime) | No | 0 descargas, 0 likes |
| Blackfrost-AI/MiMo-V2.6-Flash-MOPD-Derisking-Intervention-Runtime | Paquete de runtime equivalente para la variante Flash | MiMo-V2.6-Flash (referencia no confirmada en la informacion disponible) | No disponible | No disponible | No disponible | No disponible |
| XiaomiMiMo/MiMo-V2.6-Pro-MOPD | Checkpoint del modelo base | - | No disponible en el repositorio del runtime | Regido por el repositorio de origen | Si | Referencia de descarga fijada por el autor |
| MiMo-V2.6-Pro (modelo comercial de Xiaomi) | Modelo omnicomodal de razonamiento | - | No disponible | No disponible | No | Descripcion oficial: "trillion-parameter" |

Comparativas con alternativas de otros fabricantes (por ejemplo, otros modelos MoE de gran tamano con contexto largo): no disponibles, al no existir métricas publicadas de este paquete.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo utilizable por sí solo: sin descargar aparte el checkpoint fijado de MiMo-V2.6-Pro-MOPD y sin una pila SGLang 0.5.19 compatible, no hay nada que ejecutar.
- La intervención suprime direcciones de rechazo. Esto puede degradar o eliminar comportamientos de seguridad del modelo base y no debe tratarse como una mejora de seguridad. El autor no ofrece ninguna garantía en ese sentido.
- El triaje que seleccionó la pasada 2 es automático y basado en marcadores, con prompts de control separados; no es una revisión semántica ni una evaluación amplia de calidad.
- Requalificación obligatoria: el propio autor indica que el paquete debe volver a validarse tras cambiar el checkpoint, el tokenizer, el prompt de sistema, el runtime, la arquitectura de GPU, el valor de alpha o el conjunto de direcciones.
- Dependencia estricta de versiones: SGLang 0.5.19 sin modificar, seis hashes base concretos y hardware Blackwell. CUDA, PyTorch, FlashInfer y FlashAttention son específicos de plataforma y no se sustituyen con este paquete.
- Licencia: el runtime y los artefactos de dirección se publican bajo Apache-2.0, pero los pesos del modelo base siguen rigiéndose por los terminos de su repositorio de origen, que no se detallan en la información disponible. Verificar antes de cualquier uso comercial.
- Idiomas soportados, sesgos conocidos y riesgo de alucinación del modelo base: no disponibles en la información proporcionada.
- La model card menciona componentes no publicados (prompt text, activaciones capturadas, trazas de evaluación, credenciales de despliegue), lo que limita la reproducibilidad completa del método.
- La superficie de red por defecto es loopback sin autenticación; exponer el servicio requiere poner delante autenticación o una red privada.
- El cargador usa el loader restringido `weights_only` de PyTorch y validación de rutas, pero sigue siendo software de investigación con 0 descargas y sin adopción verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Blackfrost-AI/MiMo-V2.6-Pro-MOPD-Derisking-Intervention-Runtime
- Repositorio en GitHub: https://github.com/Blackfrost-AI/MiMo-V2.6-Pro-MOPD-Derisking-Intervention-Runtime/tree/main
- Variante para MiMo-V2.6-Flash: https://huggingface.co/Blackfrost-AI/MiMo-V2.6-Flash-MOPD-Derisking-Intervention-Runtime
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Pagina oficial de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Ficha de MiMo-V2.6-Pro: https://mimo.mi.com/models/en-US/mimo-v2.6-pro
- Metricas de entrenamiento RL de MiMo-V2.6: http://mimo.xiaomi.com/rl/
