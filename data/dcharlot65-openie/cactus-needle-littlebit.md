# dcharlot65-openie/Cactus-Needle-LittleBit

## Resumen

Cactus-Needle-LittleBit es un checkpoint de pesos "vivos" (living weights) derivado de Cactus-Compute/needle, adaptado mediante la combinación de LittleBit-2 y Sakana SVF y empaquetado en el formato `.jsyn` propietario de JouleDB. Lo desarrolla el usuario dcharlot65-openie dentro del ecosistema openIE, una base de datos termodinámica con un sustrato Kubernetes-native para IA y agentes (JouleKube) y un runtime de inferencia sin PyTorch. El modelo no se distribuye como pesos convencionales en safetensors o GGUF, sino como un artefacto comprimido de 1,13 MB que representa 30.427.676 parámetros a 0,2188 bits por peso.

El problema que aborda es la compresión extrema: reducir un modelo de 58,04 MB en FP16 a 1,13 MB (factor 51,19x) mediante factorización previa de matrices en bitplanos de 2D y vectores 1D de LayerNorm, sesgos y convoluciones depthwise. Es relevante por su enfoque sub-1-bit y por su integración con un runtime de inferencia propio orientado a despliegues en Kubernetes, aunque su ecosistema es muy específico y no estándar.

La información pública disponible es escasa: el repositorio de Hugging Face aparece con 0 GB de tamaño, sin descargas ni likes, sin pipeline declarado y sin idiomas especificados. La model card se limita al perfil de compresión y a instrucciones de uso con JouleDB, sin detallar arquitectura interna, datos de entrenamiento ni evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Cactus-Compute/needle; factorización LittleBit-2 + Sakana SVF en bitplanos) |
| Parametros totales | 30.427.676 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit (0,2188 BPW promedio); tensores en bitplanos 2D y vectores 1D |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.jsyn` (JouleDB, zstd + CRC32); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo base Cactus-Compute/needle en la información proporcionada. El checkpoint se describe como una adaptación pre-factorizada que combina LittleBit-2 con Sakana SVF, representando los pesos como 114 tensores de bitplanos 2D más 114 vectores 1D para LayerNorm, sesgos y convoluciones depthwise. El tamaño equivalente en FP16 sería de 58,04 MB, comprimido a 1,13 MB en formato `.jsyn` con compresión zstd y verificación CRC32.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de la propia factorización de pesos y el empaquetado termodinámico de JouleDB.

## Capacidades

- No se documentan capacidades específicas de generación de texto, razonamiento, código, matemáticas o visión en la información disponible.
- El modelo se presenta como un checkpoint de pesos vivos para inferencia en el runtime JouleDB, sin detallar tareas soportadas.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se mencionan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Despliegue en clústeres Kubernetes: el modelo se integra con JouleKube, el sustrato Kubernetes-native de openIE, mediante `jouledb serve`, lo que permite servirlo como servicio dentro de un clúster sin dependencias de PyTorch.
- Inferencia en entornos con restricciones extremas de almacenamiento: con 1,13 MB en disco, es adecuado para dispositivos edge o contenedores donde el espacio es crítico y no cabe un checkpoint FP16 convencional.
- Experimentación con compresión sub-1-bit: sirve como referencia práctica para investigadores que quieran evaluar la viabilidad de pesos por debajo de 1 bit por parámetro en tareas reales.
- Integración en pipelines de agentes sobre JouleDB: al usar el mismo runtime que la base de datos termodinámica, puede incorporarse a flujos de agentes gestionados por openIE sin conversión de formato.
- Pruebas de reproducibilidad de artefactos: el uso de zstd y CRC32 en el formato `.jsyn` facilita verificar la integridad del checkpoint en despliegues automatizados.
- Docencia y demostraciones de factorización de pesos: el perfil de compresión (51,19x) y el desglose de tensores permiten ilustrar técnicas de bitplanos y factorización en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint pesa 1,13 MB en disco y 58,04 MB en equivalente FP16, por lo que la huella de memoria sería muy reducida, pero no se documenta el consumo real del runtime JouleDB.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible; el runtime JouleDB es un binario de Rust (`cargo binstall jouledb`) y no se especifican requisitos de aceleración.
- Opciones de despliegue: JouleDB v0.2.4+ mediante `jouledb serve --http-addr 127.0.0.1:8080` y `db.hf_pull(...)`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cactus-Needle-LittleBit | 30.427.676 | no disponible | `.jsyn` (JouleDB) | MIT | Hugging Face, 0 descargas |
| Cactus-Compute/needle (base) | no disponible | no disponible | no disponible | MIT | Hugging Face (referenciado como base) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos de la misma categoría con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no evaluado en la información disponible.
- Limitaciones de contexto o idioma: no se especifican ni la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base Cactus-Compute/needle también debe cumplir su licencia MIT; conviene verificar la atribución en productos derivados.
- Dependencia de un ecosistema no estándar: el formato `.jsyn` y el runtime JouleDB son específicos de openIE, lo que limita la portabilidad frente a safetensors, GGUF o herramientas convencionales.
- Madurez del artefacto: repositorio con 0 descargas, 0 likes, tamaño reportado de 0 GB y creado en 2026-11-23, lo que sugiere un proyecto muy reciente y sin validación comunitaria.
- Falta de documentación de evaluación: no hay benchmarks ni métricas de calidad, por lo que no se recomienda su uso en producción sin una validación propia.
- Compatibilidad: no se confirma que funcione fuera de JouleDB v0.2.4+ ni en infraestructuras sin Kubernetes.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Cactus-Needle-LittleBit
- Modelo base: https://huggingface.co/Cactus-Compute/needle
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
