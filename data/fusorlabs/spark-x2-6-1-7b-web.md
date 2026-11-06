# fusorlabs/spark-x2.6-1.7b-web

## Resumen

Spark-X2.6-1.7B-web es una compilación del modelo de generación de texto XHToken/Spark-X2.6-1.7B (1.700 millones de parámetros) empaquetada por fusorlabs para su ejecución en el navegador mediante WebAssembly. No se trata de un checkpoint en PyTorch o safetensors, sino de un bundle propietario del runtime fusor-ai que contiene los pesos cuantizados a 7 bits y un manifiesto que describe cada tensor y sus partes.

El objetivo del paquete es permitir conversaciones de texto completamente en el dispositivo (on-device), ejecutando la inferencia en la CPU del cliente a través del runtime spark-x2-6-wasm, sin necesidad de servidores ni de conexión a una API externa. Esto resulta relevante para aplicaciones web que requieren privacidad de datos, funcionamiento offline o despliegue sin costes de infraestructura de inferencia.

La ficha se basa exclusivamente en la información publicada en el repositorio de Hugging Face y en la model card del autor. No se dispone de detalles sobre la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks del modelo base, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base XHToken/Spark-X2.6-1.7B; sin detalles publicados) |
| Parametros totales | 1.700 millones (1.7B, segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | perfil `q7` (matrices grandes a 7 bits, 1921 MB); no se documentan otros perfiles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | bundle fusor-ai (manifest.json + partes nombradas por hash BLAKE3); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura del modelo base XHToken/Spark-X2.6-1.7B en la información disponible: no se especifica si es un transformer denso, un modelo MoE, un híbrido SSM ni ninguna innovación de atención. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otro tipo de ajuste.

Lo que sí describe la model card es el proceso de compilación: el checkpoint original se procesa con el perfil `q7`, que cuantiza cada matriz grande a 7 bits y produce un total de 1921 MB. El bundle resultante contiene un `manifest.json` que lista cada tensor y cada parte, y cada parte se nombra con su hash BLAKE3, que el runtime verifica durante la carga. El proceso es reproducible ejecutando `just model` en el repositorio spark-x2-6-wasm, que descarga el checkpoint y compila el mismo bundle. La revisión concreta del modelo base utilizada es `f18c032c7675f807c0fdffe281dbe124edba2605`.

## Capacidades

- Generación de texto conversacional: el paquete está orientado a mantener una conversación de texto en el dispositivo, segun la model card.
- Ejecución on-device en el navegador: la inferencia se realiza en la CPU del cliente mediante WebAssembly, sin backend remoto.
- Verificación de integridad en carga: el runtime comprueba el hash BLAKE3 de cada parte del bundle al cargarlo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en aplicaciones web con privacidad por diseño: al ejecutarse íntegramente en la CPU del navegador mediante el runtime spark-x2-6-wasm, los mensajes del usuario no salen del dispositivo, lo que encaja en sectores con requisitos estrictos de tratamiento de datos.
- Demos y prototipos sin infraestructura de inferencia: un equipo puede publicar un Space o una página web que cargue el bundle de 1921 MB y ofrezca generación de texto sin aprovisionar GPUs ni pagar por tokens de API.
- Funcionamiento offline o en redes restringidas: una vez descargado el bundle, la conversación no depende de conectividad con un servidor de inferencia, útil en entornos con red intermitente o bloqueada.
- Distribución de contenido educativo interactivo: tutoriales o materiales formativos que incorporan un chat de texto embebido y funcionan en el propio navegador del estudiante.
- Validación de pipelines de compilación de modelos: el repositorio permite reproducir el bundle con `just model`, lo que sirve para verificar la cadena de cuantización y empaquetado de fusor-ai antes de adoptarla en otros modelos.
- Integración en aplicaciones de escritorio o web basadas en WebAssembly: cualquier producto que ya use WASM como target puede incorporar el runtime y el bundle sin cambiar de stack tecnológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del bundle: 1.9 GB en el repositorio; los pesos cuantizados a 7 bits ocupan 1921 MB, que deben descargarse y cargarse en memoria del navegador.
- Inferencia en CPU: el runtime ejecuta el modelo en la CPU del dispositivo cliente a través de WebAssembly; no se documenta uso de GPU ni de aceleración WebGPU.
- VRAM estimada: no aplica en el escenario previsto (CPU); no disponible para un hipotético despliegue con GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el paquete está diseñado para el runtime de navegador, no para llama.cpp, vLLM, Ollama ni TGI.
- Opciones de despliegue: exclusivamente el runtime spark-x2-6-wasm; la model card indica que el bundle solo carga en ese runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| fusorlabs/spark-x2.6-1.7b-web | 1.7B | no disponible | bundle fusor-ai (q7, 7 bits) | Apache-2.0 | Si, via spark-x2-6-wasm |
| XHToken/Spark-X2.6-1.7B | 1.7B | no disponible | no disponible (checkpoint original) | no disponible | No documentado |
| Otras alternativas de ~1.7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Portabilidad nula: el bundle no es un checkpoint PyTorch ni safetensors y solo carga en el runtime spark-x2-6-wasm; no se puede usar con llama.cpp, vLLM, Ollama, TGI ni transformers.
- Ausencia de datos técnicos: no se documentan arquitectura, contexto, idiomas, dataset de entrenamiento ni benchmarks, lo que impide evaluar su calidad antes de integrarlo.
- Sesgos y alucinaciones: no hay información publicada sobre sesgos conocidos ni sobre tasas de alucinación del modelo base; deben asumirse los riesgos habituales de un modelo de 1.7B sin evaluación publicada.
- Limitaciones de idioma y contexto: se desconocen los idiomas soportados y la longitud de contexto, por lo que no se puede garantizar un comportamiento correcto en castellano ni en conversaciones largas.
- Coste de descarga en cliente: 1921 MB de pesos más el manifiesto deben transferirse y cargarse en el navegador, lo que puede ser inviable en conexiones lentas o dispositivos con poca memoria.
- Licencia: Apache-2.0 permite uso comercial, pero la licencia del modelo base debe verificarse de forma independiente, ya que la model card no la detalla.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusorlabs/spark-x2.6-1.7b-web
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Runtime y repositorio de compilación: https://github.com/fusor-rs/spark-x2-6-wasm
- Librería fusor-ai: https://github.com/fusor-rs/fusor-ai
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/fusorlabs/spark-x2-6-wasm
