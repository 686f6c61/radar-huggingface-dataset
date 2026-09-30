# mdagosta/waldito-smoke-v1-r0002-u0-mdagosta

## Resumen

mdagosta/waldito-smoke-v1-r0002-u0-mdagosta es un artefacto de pesos publicado en Hugging Face por el desarrollador Michael D'Agosta (usuario mdagosta) bajo la denominación OpenWALDO. Según la model card, el paquete utiliza la arquitectura Llama causal-language-model estándar de la librería Transformers junto con el tokenizador de bytes schema-1 propio de OpenWALDO, y requiere cargar el tokenizador con `trust_remote_code=True`. El repositorio incluye un inventario `BOM.json` de los ficheros de la release y un `EU-BOM.json` con el mapeo de divulgación de contenido de entrenamiento del reglamento europeo de GPAI.

El dato técnico más relevante es su tamaño: 820.736 parámetros totales según los tensores safetensors, aproximadamente 0,82 millones de parámetros. Está, por tanto, tres órdenes de magnitud por debajo de los modelos de lenguaje de uso general, y el sufijo del nombre del repositorio (`smoke-v1`) apunta a un artefacto de validación de infraestructura (smoke test) más que a un modelo destinado a generar texto en producción. El tamaño del repositorio declarado es de 0,0 GB y acumula 124 descargas sin ningún like.

No se declara licencia, idiomas soportados ni longitud de contexto, y no hay información pública sobre el dataset de entrenamiento ni resultados de benchmarks. Cualquier evaluación de idoneidad para uso real queda bloqueada hasta que el autor publique esos datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama causal language model (Transformers), con tokenizador de bytes schema-1 de OpenWALDO |
| Parámetros totales | 820.736 (aproximadamente 0,82 M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; por tamaño, en fp32 ocupa unos 3,3 MB y en fp16 unos 1,6 MB, de modo que la cuantización resulta innecesaria |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline declarado | text-generation |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 124 / 0 |
| Fecha de creación (según el repositorio) | 2026-09-30 |
| Última actualización (según el repositorio) | 2026-09-30 |

## Arquitectura y entrenamiento

La model card indica explícitamente que el paquete emplea la arquitectura Llama causal-language-model estándar de Transformers. No se documenta ningún tipo de innovación arquitectónica (atención lineal, decodificación especulativa, mezcla de expertos, SSM ni híbridos). La particularidad reseñable es el tokenizador: un esquema de tokenización de bytes denominado schema-1, propio del proyecto OpenWALDO, que exige ejecutar código remoto del repositorio (`trust_remote_code=True`) para poder instanciarlo. El repositorio incluye además dos ficheros de inventario, `BOM.json` (listado de todos los ficheros de la release) y `EU-BOM.json` (mapeo de divulgación de contenido de entrenamiento conforme al régimen europeo de GPAI), lo que sugiere que el autor trabaja en un formato de publicación con trazabilidad y cumplimiento normativo.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o similares. Con 820.736 parámetros y un tokenizador de bytes, la capacidad de modelado del lenguaje es estructuralmente muy limitada, independientemente del proceso de entrenamiento. No se ha publicado ninguna descripción del pipeline de entrenamiento, de la inicialización de pesos ni del régimen de precisión utilizado.

## Capacidades

- Generación de texto autorregresiva: la arquitectura Llama es capaz de producir continuaciones token a token, pero con 0,82 M de parámetros no hay evidencia de que dichas continuaciones sean coherentes o útiles.
- Tokenización a nivel de byte: el tokenizador schema-1 de OpenWALDO opera sobre bytes, lo que en principio permite representar cualquier secuencia de bytes, incluidos textos con codificaciones no UTF-8, sin tokens fuera de vocabulario.
- Ninguna capacidad de tool calling, function calling ni agentes está documentada.
- No hay evidencia ni declaración de razonamiento multi-paso, modo «thinking», matemáticas, código, visión, audio ni multimodalidad.
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados y el uso de un tokenizador de bytes no implica por sí solo competencia multilingüe.
- Integración declarada con text-generation-inference y con endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`), lo que indica compatibilidad de despliegue, no capacidades del modelo.

## Casos de uso

- Smoke test de stacks de inferencia: cargar el modelo en vLLM, TGI o Transformers para verificar que el pipeline completo (descarga de pesos, safetensors, tokenizador con `trust_remote_code`, generación) funciona de principio a fin antes de desplegar un modelo grande. Su tamaño lo hace ideal para detectar errores de configuración sin gastar GPU.
- Pruebas de integración en CI/CD: incluirlo como modelo de juguete en la batería de tests de una plataforma de serving para validar que una actualización de Transformers, CUDA o del runtime no rompe la ruta de carga y generación.
- Validación del tokenizador de bytes schema-1: comprobar el comportamiento del tokenizador frente a entradas con bytes arbitrarios, secuencias UTF-8 inválidas o binarios, útil si el equipo trabaja con el ecosistema OpenWALDO y necesita verificar compatibilidad.
- Verificación de conversión de formatos: servir como sujeto de prueba para rutas de exportación e importación entre safetensors, GGUF u otros formatos, ya que el proceso de conversión se puede ejecutar en segundos en CPU.
- Medición de overhead de frameworks: al tener un coste computacional por token despreciable, permite aislar y medir el sobrecoste de gestión de peticiones, batching, serialización y scheduling de un servidor de inferencia.
- Material docente y depuración de implementaciones: inspeccionar paso a paso las matrices de atención y las activaciones de un transformer real sin necesidad de hardware especializado, útil para formación interna o para depurar kernels personalizados.
- Prueba de endpoints compatibles con la API de OpenAI: validar el enrutado, la autenticación y el formato de respuesta de un gateway propio usando este modelo como backend de pruebas.

No se recomienda su uso para ninguna tarea de generación de texto dirigida a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web no ha devuelto resultados de evaluación asociados a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier precisión. En fp32 los pesos ocupan aproximadamente 3,3 MB; en fp16, aproximadamente 1,6 MB. El consumo real vendrá dominado por el runtime (Python, CUDA, el servidor de inferencia), no por el modelo.
- GPU recomendadas: no se requiere GPU. Cualquier GPU, incluida una integrada o una tarjeta de gama muy baja, es más que suficiente. A100, H100 o RTX 4090 están sobredimensionadas para este artefacto.
- Inferencia en CPU: perfectamente viable. El cuello de botella será el overhead del framework y no el cómputo de las matrices.
- Cabe en cualquier GPU de consumo: sí, sin ninguna duda, y también en dispositivos embebidos con recursos muy limitados.
- Opciones de despliegue: Transformers (librería declarada), Text Generation Inference y endpoints compatibles según las etiquetas del repositorio. No hay confirmación de soporte nativo en llama.cpp u Ollama; la conversión a GGUF sería teóricamente posible pero no está documentada ni verificada.
- Latencia y throughput estimados: no disponibles como medición publicada. Dado el tamaño, se puede afirmar que el coste aritmético por token es despreciable frente al overhead de gestión de la petición en cualquier servidor de inferencia moderno.

## Comparativa con modelos similares

No disponible. No se dispone de datos verificados de modelos comparables de la misma categoría (artefactos de prueba por debajo del millón de parámetros) que permitan construir una comparativa rigurosa de parámetros, contexto, rendimiento, licencia y disponibilidad. Cualquier comparación numérica requeriría consultar las fichas oficiales de los modelos candidatos, y en la información proporcionada no hay ninguno identificado con datos contrastados.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial ni de redistribución. Tratar como no apto para producción hasta que el autor aclare los términos.
- Riesgo de alucinación: con 820.736 parámetros, la probabilidad de generar texto incoherente, factualmente incorrecto o directamente degenerado es muy alta. No debe usarse para responder consultas de usuarios.
- Idiomas soportados sin especificar: no se puede asumir competencia en castellano ni en ningún otro idioma.
- Longitud de contexto desconocida: no se ha publicado la ventana de contexto. Además, al emplear un tokenizador de bytes, cada token corresponde presumiblemente a un byte, de modo que la ventana efectiva medida en caracteres sería muy inferior a la de un tokenizador subword con el mismo número de tokens.
- `trust_remote_code=True`: cargar el tokenizador implica ejecutar código Python publicado por un tercero. Esto supone un riesgo de seguridad en entornos no aislados y debe hacerse en sandbox o revisando previamente el código del repositorio.
- Procedencia y madurez: 124 descargas y 0 likes, sin señales de validación por parte de la comunidad. Las fechas del repositorio (2026-09-30) resultan atípicas y conviene verificarlas.
- Ausencia total de trazabilidad del entrenamiento: no hay información sobre datos, sesgos, filtrado ni alineación, lo que impide cualquier evaluación de riesgos de sesgo.
- Naturaleza del artefacto: el nombre y el tamaño sugieren un smoke test de infraestructura, no un modelo funcional. Tratarlo como cualquier otra cosa llevará a conclusiones erróneas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdagosta/waldito-smoke-v1-r0002-u0-mdagosta
- Perfil del autor en Hugging Face: https://huggingface.co/mdagosta
- Perfil del autor en GitHub: https://github.com/mdagosta
- Biografía profesional del autor: https://dagosta.com/
