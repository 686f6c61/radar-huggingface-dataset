# Astra228/ChudGPT-Public

## Resumen

ChudGPT-Public es un modelo de lenguaje experimental de tipo decoder-only, entrenado desde cero por el desarrollador independiente Astra228 (ASTRA228b) con una implementación propia en PyTorch. No es un fine-tune de un modelo externo ni se distribuye en formato compatible con `transformers.AutoModel`: el repositorio incluye el código de arquitectura, el tokenizador original y los pesos en SafeTensors, junto con un runner mínimo (`run.py`) para inferencia local reproducible. El checkpoint exportado corresponde a `public_assistant_rebalance/latest.pt` y es exacto a nivel de tensor respecto al original.

El tamaño es muy reducido: la model card declara 20.999.184 parámetros, mientras que el recuento real de los tensores en SafeTensors asciende a 24.144.912. Esa discrepancia de aproximadamente 3,1 millones de parámetros no está explicada en la documentación disponible y conviene tenerla en cuenta al caracterizar el modelo. El repositorio ocupa 0,1 GB y la licencia es Apache-2.0.

Su relevancia es acotada y de carácter didáctico o de investigación: se presenta explícitamente como un experimento sin benchmarks estandarizados ni calidad comparable a asistentes comerciales. El propio autor advierte de respuestas incorrectas, alucinaciones, repeticiones, razonamiento débil y memoria conversacional limitada. Es útil como referencia de arquitectura mínima entrenada desde cero y para reproducir un pipeline completo de inferencia local, no como componente de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de implementación propia en PyTorch (no compatible con `transformers`) |
| Parámetros totales | 24.144.912 según los tensores en SafeTensors; 20.999.184 según la model card (discrepancia no documentada) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los pesos se distribuyen en SafeTensors sin variantes GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors más código Python local (`config.json`, `run.py`, `requirements.txt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only escrito a mano en PyTorch, con tokenizador propio y sin dependencia del ecosistema `transformers`. La model card indica que se entrenó de forma independiente desde cero, sin partir de pesos preentrenados de terceros, y que el checkpoint exportado corresponde al paso `public_assistant_rebalance/latest.pt`; el número de paso queda registrado en `config.json`. El SHA256 del checkpoint local original es `f551a6cb7141aa840141b5946fa56bdfdd73409c8ee24c5a4396a056c5a61320`.

No se publican datos sobre volumen de tokens de entrenamiento, composición del corpus, uso de RLHF, DPO u otras etapas de alineación. El autor aclara que los datasets crudos no se redistribuyen y que la procedencia de los datos no constituye una auditoría exhaustiva de derechos de terceros. Tampoco se incluyen credenciales de servicio, registros de chat privados ni estado de optimizador o de reanudación del entrenamiento. Un punto importante: la aplicación pública «Public V20» combina la generación neuronal con capas adicionales de lógica local (respuestas revisadas, aritmética exacta, normalización), capas que **no** se reproducen en este runner neuronal mínimo; por tanto, el comportamiento del bot en vivo no debe atribuirse a estos pesos. Los checkpoints especializados de música y LGBTQ no están incluidos.

## Capacidades

- Generación de texto conversacional en inglés, con decodificación determinista por defecto.
- Continuación y respuesta a mensajes cortos dentro de una sesión interactiva de consola.
- Historial de conversación en memoria del proceso actual (se reinicia con `/clear`, se sale con `/quit`); no hay persistencia entre ejecuciones.
- Ejecución local en CPU o CUDA mediante `python run.py --message "..." --device cpu|cuda`.
- Tokenizador propio incluido, lo que permite reproducir el preprocesado exacto.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo «thinking».
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Razonamiento, matemáticas y código: el autor advierte explícitamente de debilidad en estas áreas y recomienda verificar cualquier salida numérica o de código de forma independiente.

## Casos de uso

- Estudio de arquitecturas transformer mínimas: el repositorio incluye el código de arquitectura y del tokenizador, lo que permite leer, modificar y reentrenar un modelo completo de 24 M de parámetros en una sola GPU de consumo.
- Reproducibilidad de inferencia: el SHA256 del checkpoint y el `config.json` con el paso de entrenamiento permiten verificar que una ejecución local corresponde exactamente a los pesos publicados.
- Docencia y talleres: sirve para ilustrar el ciclo completo (tokenizador propio, entrenamiento desde cero, exportación a SafeTensors, runner de consola) sin los costes asociados a modelos de miles de millones de parámetros.
- Pruebas de integración de runners propios: útil como caso de prueba para pipelines que no usan `transformers`, validando carga de SafeTensors y ejecución en CPU/CUDA dentro de CI.
- Experimentación con decodificación: al ser determinista por defecto y con tiempos de generación muy bajos, permite comparar estrategias de sampling sin coste apreciable de cómputo.
- Cliente de escritorio experimental: el proyecto mantiene un cliente nativo (Windows/macOS/Linux) que consume la API pública, útil como ejemplo de integración de un modelo pequeño en una aplicación de chat con historial persistente y búsqueda local.
- No se recomienda para atención al cliente, generación de código en producción ni ningún flujo con decisiones consecuentes, según las propias advertencias del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no reclama puntuaciones estandarizadas ni calidad equiparable a ChatGPT.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 97 MB de pesos en fp32 y unos 48 MB en fp16, calculados a partir de los 24,1 M de parámetros; el consumo real del proceso incluye el overhead de PyTorch y del entorno CUDA.
- GPU recomendadas: cualquiera con soporte CUDA compatible con la build de PyTorch instalada; el tamaño del modelo no exige A100 ni H100.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, con uso de VRAM muy inferior a 1 GB. También funciona en CPU, que es el modo documentado por defecto (`--device cpu`).
- Opciones de despliegue: únicamente el runner propio incluido (`run.py`) y el código Python del repositorio. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni Inference Providers, al no ajustarse los pesos a la interfaz de `transformers`.
- Latencia y throughput: no disponibles. Por el tamaño del modelo se espera generación en el orden de milisegundos por token en CPU moderna y aún menor en GPU, pero no se han publicado mediciones.
- Almacenamiento: el repositorio completo ocupa 0,1 GB; es necesario Git LFS para clonar los pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / ecosistema | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| ChudGPT-Public | 24,1 M (SafeTensors) / 21,0 M (model card) | No disponible | Apache-2.0 | SafeTensors + código propio, sin `transformers` | No publicado |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache-2.0 | `transformers`, GGUF, amplio soporte de herramientas | Publicados por el autor |
| GPT-2 small | 124 M | 1.024 tokens | MIT | `transformers`, GGUF, ecosistema maduro | Publicados por el autor |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache-2.0 | `transformers`, GGUF, vLLM, Ollama | Publicados por el autor |

La comparación es estructural más que de rendimiento: ChudGPT-Public es entre cinco y cincuenta veces menor que las alternativas citadas y carece de resultados de evaluación publicados, por lo que no es posible situarlo en una escala de calidad. Su diferencial no es la capacidad, sino la trazabilidad del entrenamiento desde cero y la ausencia de dependencia del ecosistema Hugging Face `transformers`.

## Limitaciones y advertencias

- Calidad: el autor advierte de respuestas incorrectas, alucinaciones, repetición de texto, razonamiento débil y memoria conversacional limitada.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- Idioma: solo se declara inglés; no hay evidencia de competencia en castellano ni en otros idiomas.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad; el corpus de entrenamiento no se distribuye ni se describe.
- Verificación obligatoria: no deben usarse las salidas para decisiones consecuentes; el propio autor pide comprobar de forma independiente el código y los cálculos generados.
- Divergencia respecto a la demo pública: el comportamiento de la aplicación «Public V20» incluye capas de lógica no presentes en estos pesos, de modo que los resultados de tests de la aplicación no son válidos para el checkpoint.
- Compatibilidad: al no usar `transformers.AutoModel`, no se integra directamente con herramientas estándar (pipelines, TGI, vLLM, Ollama) sin trabajo de adaptación.
- Ejecución de código: el repositorio requiere ejecutar Python local de terceros; conviene revisar el código antes de lanzarlo.
- Licencia: Apache-2.0 permite uso comercial, pero la falta de auditoría de derechos sobre los datos de entrenamiento traslada al usuario el riesgo legal asociado.
- Discrepancia de parámetros: la diferencia entre los 20.999.184 declarados y los 24.144.912 reales no está explicada y debería aclararse antes de citar cifras del modelo.
- Madurez: 0 descargas y 0 «likes» en el momento de la consulta; proyecto unipersonal sin histórico de mantenimiento verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Astra228/ChudGPT-Public
- Repositorio GitHub: https://github.com/ASTRA228b/ChudGPT-Public
- Sitio del proyecto: https://chudgpt-landing.vercel.app/
- Guía de modelos del proyecto: https://chudgpt-landing.vercel.app/model-guide
- Perfil del autor en Hugging Face: https://huggingface.co/Astra228
