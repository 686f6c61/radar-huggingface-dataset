# MihhailTLN/ownowl-gigachat3.1

## Resumen

ownowl-gigachat3.1 es un reempaquetado del modelo ai-sage/GigaChat3.1-10B-A1.8B, un transformer de tipo Mixture of Experts (MoE) con 10.000 millones de parámetros totales y 1.800 millones activos por token, publicado por MihhailTLN para la aplicación OwnOwl de iPhone. No se trata de un modelo nuevo: el autor ha cuantizado los pesos a 4 bits en formato MLX (tamaño de grupo 64) y ha reorganizado los tensores para que la app pueda leerlos directamente desde la memoria flash del teléfono, permitiendo inferencia completamente offline en el dispositivo.

El repositorio separa los tensores no pertenecientes a los expertos enrutados (`nonexpert.safetensors`) de los pesos de los expertos (`pack/`), lo que facilita la carga selectiva y reduce la huella en memoria durante la ejecución. El modelo base está orientado a rusófonos e inglés, con licencia MIT, y su interés principal radica en demostrar un despliegue MoE de 10B en hardware móvel de gama alta mediante la librería MLX de Apple.

Al ser un reempaquetado con 0 descargas y 0 likes en el momento de la ficha, no hay datos de benchmarks propios ni métricas de rendimiento publicadas por el autor más allá del `reference.json` de autodiagnóstico de la app.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (tag `deepseek_v3` en Hugging Face) |
| Parametros totales | 10B (según el nombre del modelo base: GigaChat3.1-10B-A1.8B) |
| Parametros activos | 1,8B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX, group size 64 |
| Idiomas soportados | Ruso e inglés |
| Licencia | MIT |
| Formato de pesos | MLX: `nonexpert.safetensors` + expertos en `pack/` (lectura directa desde flash) |

## Arquitectura y entrenamiento

El modelo base GigaChat3.1-10B-A1.8B es un transformer con capas MoE: dispone de 10.000 millones de parámetros totales pero solo activa 1.800 millones por token, lo que reduce el coste computacional de la inferencia. El tag `deepseek_v3` sugiere que la arquitectura de enrutamiento de expertos sigue el esquema introducido por DeepSeek-V3, aunque no se dispone de detalles adicionales sobre el número de expertos, la dimensión oculta o la estrategia de balanceo de carga en la información proporcionada.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El reempaquetado de MihhailTLN no modifica los pesos semánticamente: aplica cuantización 4-bit MLX con group size 64 y reorganiza los tensores para que los expertos enrutados residan en `pack/` con un layout optimizado para lecturas directas desde el almacenamiento flash del iPhone. El resto de tensores se guarda intacto en `nonexpert.safetensors`.

## Capacidades

- Generación de texto en ruso e inglés.
- Razonamiento multi-step y conversación multi-turno (heredado del modelo base).
- Ejecución totalmente offline en dispositivo, sin conexión a internet.
- Carga selectiva de expertos desde flash, permitiendo que un MoE de 10B quepa en un iPhone.
- Autodiagnóstico integrado mediante `reference.json`, con prompts fijos y tokens de salida de referencia para validar la inferencia.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente personal offline en iPhone: la app OwnOwl descarga el repositorio en el primer arranque y ejecuta el modelo sin red, útil en entornos sin conectividad o con requisitos de privacidad estrictos.
- Traducción y redacción ruso-inglés en dispositivo: el modelo cubre ambos idiomas y puede generar texto sin enviar datos a servidores externos.
- Procesamiento de documentos confidenciales: al residir los pesos en el teléfono y no requerir red, es adecuado para resumir o reescribir contenido sensible localmente.
- Autodiagnóstico de la app: `reference.json` permite al desarrollador verificar que la cuantización MLX produce los tokens esperados tras cada actualización del runtime.
- Prototipado de MoE en hardware móvil: sirve como referencia para investigadores que quieran estudiar la viabilidad de un MoE 10B/1.8B activo en dispositivos Apple.
- Base para experimentos de cuantización MLX: el layout `nonexpert.safetensors` + `pack/` es un ejemplo práctico de partición de pesos para lectura desde flash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Repositorio de 6,1 GB, correspondiente a la cuantización 4-bit MLX del modelo de 10B.
- Diseñado para ejecutarse en iPhone mediante la librería MLX de Apple; no se especifica qué modelos de iPhone son compatibles ni la RAM mínima requerida.
- La partición `nonexpert.safetensors` + `pack/` está pensada para lecturas directas desde flash, lo que reduce la presión sobre la RAM durante la carga de expertos.
- Opciones de despliegue: app OwnOwl en iOS con MLX. No hay información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ownowl-gigachat3.1 | 10B / 1,8B | no disponible | MIT | MLX 4-bit | Hugging Face (repo de app) |
| ai-sage/GigaChat3.1-10B-A1.8B | 10B / 1,8B | no disponible | MIT | safetensors (original) | Hugging Face |
| DeepSeek-V3 (referencia arquitectónica) | 671B / 37B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento ni de contexto para confrontarlo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un reempaquetado, no un modelo nuevo: cualquier limitación del modelo base GigaChat3.1-10B-A1.8B se hereda íntegramente.
- Cobertura lingüística limitada a ruso e inglés; no hay soporte documentado de castellano.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar aplicaciones que requieran ventanas largas.
- La cuantización 4-bit MLX con group size 64 puede introducir degradación de calidad respecto al modelo original en safetensors; no se han publicado evaluaciones comparativas.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en esta ficha.
- No hay datos sobre sesgos conocidos del modelo base.
- Uso comercial permitido por la licencia MIT, pero conviene revisar los términos completos del modelo base en ai-sage/GigaChat3.1-10B-A1.8B.
- Dependencia del runtime MLX y de la app OwnOwl: no es un artefacto directamente utilizable en servidores o pipelines de terceros.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: madurez y validación comunitaria inexistentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MihhailTLN/ownowl-gigachat3.1
- Modelo base: https://huggingface.co/ai-sage/GigaChat3.1-10B-A1.8B
