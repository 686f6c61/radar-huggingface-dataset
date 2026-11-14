# botp/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Coder-Strata-GGUF

## Resumen

Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Coder-Strata-GGUF es una distribución GGUF publicada por el usuario botp que empaqueta, sin modificar los pesos, la versión podada y cuantizada del modelo Qwen3.8-Flash-Next elaborada por el ISTA-DASLab (Instituto de Ciencia y Tecnología de Austria). Sobre esa base se añade un vector de control (dirección de rechazo) extraído de los pesos del checkpoint Huihui-Qwen3.8-Flash-Next-abliterated, que se aplica en tiempo de ejecución mediante proyección sobre el residual stream con el runtime Strata. El resultado es un modelo de 116,5B parámetros efectivos (frente a los 176,9B del original) que conserva el 50% de los expertos en cada capa, orientado a código y tareas agénticas, con capacidades de visión.

El modelo resuelve un problema práctico: permitir ejecutar una variante de un MoE de gran tamaño en hardware de consumo (GPU de 12 GB o más y 32 GB de RAM), reduciendo el peso de descarga de 83,6 GB (IQ3_S) a 58,4 GB y manteniendo en memoria solo el primer shard (29,6 GB). La poda de expertos se seleccionó sobre datos de código, agentes y visión, y según el autor de la poda conserva el 91,3% del rendimiento en SWE-bench Verified y el 98,7% en LiveCodeBench v6 respecto al modelo completo.

La relevancia actual radica en que combina tres técnicas emergentes —poda de expertos guiada por datos, cuantización de bajo bit (3,5 bits en los expertos conservados) y control vectors aplicados por proyección— en un único artefacto desplegable con llama.cpp/Strata. La licencia es la Qwen Community License 1.0, con las restricciones que ello implica para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con visión (image-text-to-text); pesos GGUF |
| Parámetros totales | 120,8B (según safetensors); 116,5B efectivos tras poda (60,4B en expertos, 51,2B en tabla n-gram, 4,9B en el resto del transformer) |
| Parámetros activos | no disponible |
| Longitud de contexto | probado hasta 262.144 tokens (8.346 expertos en tarjeta a esa longitud); 65.536 tokens con 8.524 expertos |
| Tipos de cuantización | GGUF a 3,5 bits en los expertos conservados; tamaño IQ1_M indicado en el ejemplo de despliegue |
| Idiomas soportados | no disponible (el autor advierte que idiomas distintos del inglés empeoran tras la poda) |
| Licencia | qwen-community-license-1.0 (license: other) |
| Formato de pesos | GGUF (dos shards + proyector de visión BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Qwen3.8-Flash-Next, con 512 expertos por capa en el original. ISTA-DASLab aplicó poda de expertos conservando 256 de los 512 por capa, seleccionados sobre datos de código, agentes y visión, y cuantizó los pesos restantes a 3,5 bits mediante su técnica GSQ (paper arXiv:2604.18556) y el método RCO (paper arXiv:2605.00649). La poda no toca la atención, el router ni el residual stream del modelo completo; solo se eliminan la mitad de los expertos que escriben en ese stream.

La innovación principal de esta distribución es la aplicación en tiempo de ejecución de un control vector por proyección. Strata resta una dirección `r` de cada residual stream tras las capas seleccionadas mediante `h = h - (h · r) r`, usando la dirección de rechazo extraída del checkpoint Huihui (que modificó 144 tensores de escritura residual con una edición de rango uno). El autor verificó empíricamente que la dirección sigue funcionando tras la poda, algo que no era evidente porque solo se conserva la mitad de los expertos. Los pesos permanecen intactos respecto a la publicación de ISTA-DASLab; con `"experimental_speed_projection": false` se ejecuta el modelo original sin proyección. El runtime incorpora además una capa MTP (multi-token prediction) de borrador de aproximadamente 6 GB, descargada del checkpoint original de Qwen, para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento general, con un sesgo claro hacia código y tareas agénticas tras la poda selectiva.
- Generación y edición de código, con soporte para tareas de reparación de bugs e ingeniería de software (evaluado en SWE-bench Verified y LiveCodeBench v6).
- Capacidades de visión: pipeline image-text-to-text con proyector de visión BF16 (`mmproj-Qwen3.8-Flash-Next-BF16.gguf`).
- Modo thinking (razonamiento extendido) heredado del base Qwen3.8-Flash-Next; las mediciones del autor lo desactivan explícitamente en las pruebas de rechazo.
- Ejecución de contexto largo: probado a 65.536 y 262.144 tokens.
- Decodificación especulativa mediante capa MTP de borrador.
- Supresión de rechazos mediante control vector aplicado por proyección (comportamiento configurable y reversible).
- Soporte de tool calling y function calling: no disponible en la información proporcionada (no se documenta explícitamente en la model card).
- Capacidades multilingües: degradadas fuera del inglés según la model card de Strata.

## Casos de uso

- Reparación automática de bugs en repositorios: el modelo conserva el 91,3% del rendimiento en SWE-bench Verified del original, por lo que puede integrarse en pipelines que reciben un issue y un checkout del repositorio, generan un parche y lo validan contra la suite de tests.
- Generación de código en producción con contexto largo: con 65.536 tokens de ventana y 8.524 expertos en una RTX 3090, permite pasar ficheros completos y documentación de API en el prompt para tareas de refactorización multiarchivo.
- Asistente de código local en estación de trabajo: con 12 GB de VRAM y 32 GB de RAM, Strata levanta un servidor compatible con OpenAI (`/v1`) y Anthropic (`/v1/messages`), lo que permite conectarlo a editores e IDEs sin enviar código a la nube.
- Análisis de capturas y diagramas en flujos de ingeniería: el pipeline image-text-to-text permite pasar capturas de errores, diagramas de arquitectura o UI mockups junto con el código para tareas de diagnóstico o generación de tests de interfaz.
- Evaluación de robustez y red teaming: al poder alternar entre el modelo con proyección y el original (`experimental_speed_projection: false`) con los mismos pesos, sirve para medir el efecto de la supresión de rechazos sin cambiar de checkpoint.
- Investigación sobre poda de expertos: los dos shards y el proyector tienen SHA256 verificable y coinciden byte a byte con el repo de ISTA-DASLab, lo que facilita reproducir experimentos de poda y cuantización sobre un MoE de 120B en hardware modesto.
- Despliegue de agentes de código en CI/CD: la capa MTP de decodificación especulativa y el servidor HTTP local permiten ejecutar tareas de varios pasos (leer, editar, testear) dentro de un runner con GPU de 12 GB.

## Benchmarks y rendimiento

Los datos disponibles son los reportados por ISTA-DASLab para la versión podada respecto al modelo completo, y las mediciones del autor de esta distribución sobre rechazos.

| Benchmark | Resultado relativo al modelo completo | Fuente |
|---|---|---|
| SWE-bench Verified | 91,3% de la puntuación del modelo completo | ISTA-DASLab (vía model card) |
| LiveCodeBench v6 | 98,7% de la puntuación del modelo completo | ISTA-DASLab (vía model card) |
| Rendimiento fuera de código | inferior al modelo completo (sin cifra) | ISTA-DASLab (vía model card) |
| Idiomas distintos del inglés | degradados (sin cifra) | Strata (vía model card) |

Mediciones de hardware del autor (una RTX 3090 a 300 W, EPYC 7642 de 48 núcleos, 125 GB de RAM, Strata 0.1.40 para sm_86 con `--spec-min-p 0.7`):

| Contexto | Expertos en tarjeta (de 12.288) |
|---|---|
| 65.536 tokens | 8.524 |
| 262.144 tokens | 8.346 |

Las pruebas de rechazo se hicieron con decodificación greedy a 96 tokens por respuesta sobre un conjunto de 10 prompts (lock picking, phishing, keylogger, relato explícito y similares), muestreados a temperatura 1,0; los resultados numéricos de esa tabla no se incluyen en la información proporcionada. No se han publicado en la información disponible puntuaciones absolutas de MMLU, HumanEval o GSM8K para esta distribución.

## Requisitos de hardware

- VRAM estimada: mínimo 12 GB de VRAM según el autor; en la práctica, una RTX 3090 (24 GB) aloja 8.524 de los 12.288 expertos a 65.536 tokens de contexto y 8.346 a 262.144.
- RAM: 32 GB mínimo; el autor usó 125 GB en su equipo de pruebas. Solo el primer shard (29,6 GB) debe residir en memoria.
- GPU recomendadas: RTX 3090, tarjetas NVIDIA o AMD con 12 GB o más. El autor compiló Strata para sm_86.
- ¿Cabe en GPU de consumo? Sí, en RTX 3090 y previsiblemente en RTX 4090 (24 GB); no se documenta su funcionamiento en tarjetas de 12 GB más allá del mínimo declarado.
- Opciones de despliegue: runtime Strata (versión 0.1.40 o superior, build desde fuente o instalador con `./setup.sh --setup --family coder`), servidor compatible con OpenAI en `/v1` y Anthropic en `/v1/messages`. llama.cpp carga los GGUF, pero su `--control-vector` estándar suma el vector en lugar de proyectarlo, por lo que sin Strata el modelo se comporta como el original.
- Almacenamiento: descarga de 58,4 GB (frente a 83,6 GB para IQ3_S del no podado); shard 2 y proyector de visión son reutilizables desde otras distribuciones.
- Latencia y throughput: no disponible; solo se documenta el uso de decodificación especulativa con capa MTP y `--spec-min-p 0.7`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Coder podado + control vector) | 116,5B efectivos / 120,8B safetensors | probado a 262.144 | 91,3% SWE-bench Verified y 98,7% LiveCodeBench v6 respecto al completo | Qwen Community License 1.0 | GGUF, requiere Strata para la proyección |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | mismos pesos sin proyección | no disponible | mismos benchmarks relativos | Qwen Community License 1.0 | GGUF, llama.cpp estándar |
| Qwen/Qwen3.8-Flash-Next (completo) | 176,9B (120,8B en expertos, 51,2B n-gram) | no disponible | referencia base | Qwen Community License 1.0 | pesos originales |
| Huihui-Qwen3.8-Flash-Next-abliterated | 176,9B | no disponible | no disponible | no disponible | checkpoint completo con abliteración estática |

## Limitaciones y advertencias

- La poda reduce capacidades fuera de código: el propio ISTA-DASLab indica que es más débil fuera de ese dominio, y Strata añade que los idiomas distintos del inglés empeoran. No es un modelo de propósito general.
- El autor no ejecutó el instalador de Strata de principio a fin; construyó la versión 0.1.40 desde fuente y arrancó el motor con los argumentos que `setup` escribe para `--family coder`. El flujo de instalación documentado no está validado en todos los entornos.
- La supresión de rechazos elimina una capa de seguridad: los prompts del probe incluyen lock picking, phishing y keylogger, y el modelo está configurado para no rechazarlos. No debe exponerse sin filtros externos.
- La proyección solo funciona con Strata; en llama.cpp estándar el vector se suma y el modelo se comporta como el original, lo que puede generar confusión sobre el comportamiento real desplegado.
- La licencia Qwen Community License 1.0 impone condiciones adicionales al uso comercial; conviene revisar el texto de `LICENSE` antes de desplegar.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales de un modelo de código en tareas de ingeniería.
- Contexto efectivo limitado por VRAM: a 262.144 tokens solo quedan 8.346 expertos en una RTX 3090, con la consiguiente degradación potencial de la calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente de las mediciones del autor.
- Sesgos: no documentados en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/botp/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Coder-Strata-GGUF
- Repo base de pesos: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint abliterated de Huihui: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Repo del autor con las cuatro tallas sin podar: https://huggingface.co/alesha-pro/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Paper RCO: https://arxiv.org/abs/2605.00649
- Código RCO: https://github.com/IST-DASLab/RCO
- Runtime Strata: https://github.com/Niko1221/Strata
