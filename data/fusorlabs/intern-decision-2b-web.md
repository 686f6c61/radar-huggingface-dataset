# fusorlabs/intern-decision-2b-web

## Resumen

Intern-Decision-2B-web es una compilación del modelo InternLM Intern-Decision-2B (2.000 millones de parámetros) empaquetada en formato fusor-ai para su ejecución en el navegador mediante WebAssembly. Lo publica el usuario fusorlabs y está pensado para el runtime intern-decision-wasm, que carga los pesos y ejecuta la inferencia en la CPU del dispositivo del usuario sin necesidad de servidor. El modelo base resuelve tareas de decisión con probabilidades calibradas y entrada image-text-to-text.

La relevancia de esta variante no está en el modelo en sí, sino en el formato: no es un checkpoint PyTorch ni safetensors, sino un bundle propietario de fusor-ai con manifiesto y partes verificadas por hash BLAKE3. Esto lo hace útil para despliegues on-device en web, pero completamente inoperable con las herramientas habituales del ecosistema (transformers, vLLM, llama.cpp, Ollama).

El bundle ocupa 2,1 GB en el repositorio y se compiló con el perfil `mix`: capas feed-forward a 4 bits y el resto de tensores a 7 bits, con un total de 2068 MB de pesos. La licencia es Apache-2.0 y el modelo base deriva de la arquitectura Qwen3.5 según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Intern-Decision-2B, derivado de Qwen3.5) |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Perfil `mix`: feed-forwards a 4 bits, resto a 7 bits (2068 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundle fusor-ai (`manifest.json` + partes nombradas por hash BLAKE3); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Intern-Decision-2B es un transformer de 2.000 millones de parámetros desarrollado por InternLM, con pipeline image-text-to-text, lo que implica capacidad de procesar imágenes junto con texto. Según la model card del bundle, la arquitectura subyacente se apoya en Qwen3.5. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de esta publicación es el proceso de compilación: el checkpoint original en la revisión `85c5657708a09884ff9fd8d7f57789b410a97b33` se convierte mediante el perfil `mix` en un bundle con manifiesto que lista cada tensor y cada parte, verificadas por BLAKE3 en tiempo de carga. El resultado solo es cargable por el runtime intern-decision-wasm, no por frameworks estándar. La reproducibilidad del bundle se documenta mediante el comando `just model` en el repositorio intern-decision-wasm.

## Capacidades

- Generación de texto y respuesta a preguntas con probabilidades calibradas, según la descripción del autor.
- Procesamiento image-text-to-text (entrada conjunta de imagen y texto), heredado del pipeline del modelo base.
- Ejecución on-device en CPU dentro del navegador mediante WebAssembly, sin backend remoto.
- Verificación de integridad de pesos en carga mediante hashes BLAKE3.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: solo se confirma la entrada image-text-to-text; el resto no disponible.

## Casos de uso

- Asistentes web con privacidad por diseño: el modelo se ejecuta en la CPU del navegador del usuario, de modo que las consultas y las imágenes no salen del dispositivo; adecuado para aplicaciones donde no se puede enviar datos a un servidor.
- Clasificación y decisión con umbrales calibrados: al devolver probabilidades calibradas, encaja en flujos de triaje o puntuación donde se necesita una confianza numérica y no solo texto generado.
- Procesamiento de imágenes en el cliente: aplicaciones de accesibilidad o etiquetado que reciben una imagen del usuario y necesitan una descripción o decisión sin subirla a la nube.
- Demos y prototipos sin infraestructura: al ejecutarse en WebAssembly no requiere GPU ni servidor de inferencia, lo que reduce el coste de desplegar una prueba de concepto en una página web.
- Herramientas offline o de campo: escenarios con conectividad intermitente donde el modelo se descarga una vez como bundle y opera localmente.
- Validación de integridad en cadena de suministro: el manifiesto con hashes BLAKE3 permite verificar que los pesos cargados son exactamente los publicados, útil en entornos con requisitos de procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica GPU; la inferencia se ejecuta en CPU mediante WebAssembly.
- Tamaño en disco/memoria: bundle de 2068 MB (2,1 GB en el repositorio), que debe cargarse en memoria del navegador.
- GPU recomendadas: no disponible; el runtime está diseñado para CPU.
- ¿Cabe en consumer GPU? No procede: el formato no es compatible con runtimes de GPU convencionales.
- Opciones de despliegue: exclusivamente el runtime intern-decision-wasm (librería fusor-ai). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| intern-decision-2b-web (este) | 2B | no disponible | Bundle fusor-ai (4/7 bits) | Apache-2.0 | Solo navegador vía intern-decision-wasm |
| internlm/Intern-Decision-2B | 2B | no disponible | Safetensors/PyTorch | no disponible | transformers y runtimes estándar |
| Modelos 2B tipo Qwen3.5 | ~2B | no disponible | Safetensors, GGUF | variable | vLLM, llama.cpp, Ollama |

La diferencia clave frente al modelo base es el formato: la versión original es consumible por el ecosistema estándar, mientras que este bundle solo funciona en el runtime wasm del autor. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Formato propietario: no es un checkpoint PyTorch ni safetensors; no se puede cargar con transformers, vLLM, llama.cpp, Ollama ni TGI.
- Dependencia total del runtime intern-decision-wasm; si el proyecto deja de mantenerse, el bundle queda inutilizable.
- Huella de 2,1 GB en el navegador: la descarga y carga en memoria puede ser prohibitiva en dispositivos móviles o conexiones lentas.
- Inferencia en CPU: el rendimiento será muy inferior al de una GPU; no hay datos de latencia publicados.
- Idiomas soportados no declarados: riesgo de comportamiento deficiente en castellano u otros idiomas no verificados.
- Riesgo de alucinación: inherente a los modelos generativos de 2B parámetros; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no se documentan análisis de sesgo del modelo base ni de esta compilación.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones largas sin verificación previa.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias del modelo base (Intern-Decision-2B) y de Qwen3.5 incluidas en el repositorio (`LICENSE`, `LICENSE-QWEN`).
- Cero descargas y cero likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fusorlabs/intern-decision-2b-web
- Modelo base: https://huggingface.co/internlm/Intern-Decision-2B
- Runtime: https://github.com/fusor-rs/intern-decision-wasm
- Librería fusor-ai: https://github.com/fusor-rs/fusor-ai
- Demo (Space): https://huggingface.co/spaces/fusorlabs/intern-decision-wasm
