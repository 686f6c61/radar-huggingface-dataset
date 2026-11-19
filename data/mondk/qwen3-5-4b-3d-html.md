# mondk/Qwen3.5-4B-3D-Html

## Resumen

Qwen3.5-4B-3D-Html es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario mondk y publicado en Hugging Face. Su proposito concreto es la generacion de texto-a-3D: a partir de una instruccion textual, el modelo produce un unico archivo HTML autocontenido que, usando la libreria Three.js cargada desde una CDN, renderiza un modelo 3D observable e interactivo en el navegador. No requiere instalar librerias ni dependencias locales.

El modelo conserva la arquitectura del Qwen3.5-4B original, un transformer de la familia Qwen3.5 con etiqueta de arquitectura `qwen3_5_text` en safetensors, y cuenta con 4.205.751.296 parametros totales. El repositorio ocupa 11,9 GB e incluye pesos en safetensors y una cuantizacion GGUF Q6_K. La licencia es Apache 2.0 y el idioma declarado es unicamente ingles.

Es relevante para desarrolladores que necesitan generar prototipos 3D rapidos mediante un flujo puramente textual y sin infraestructura adicional: basta pedir al modelo un HTML con Three.js y abrirlo en el navegador. El autor advierte que el proyecto avanzara lentamente y anima a la comunidad a continuar el entrenamiento, documentando su proceso en un informe tecnico. Las descargas (2294) y los likes (7) indican un interes moderado pero sostenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (etiqueta `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (pesos completos) y GGUF Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 11,9 GB |
| Pipeline | text-generation |
| Datasets de entrenamiento | mondk/Bench-3D.html, noodcon/3D-By-Gemini4Argon |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5 con 4.205.751.296 parametros. El ajuste fino esta orientado a una tarea muy especifica: la generacion de archivos HTML unicos que integran Three.js y OrbitControls desde una CDN con version fijada, fondo blanco y control de camara por rueda del raton (zoom) y boton derecho (rotacion). El prompt de sistema recomendado por el autor define estas restricciones de salida de forma explicita.

El entrenamiento se realizo sobre dos datasets: mondk/Bench-3D.html y noodcon/3D-By-Gemini4Argon (tambien referenciado como 3D-By-Argon4). El autor documenta el proceso completo y sus sugerencias de contribucion en un technical-report.pdf alojado en el repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto-a-3D: produce un unico archivo HTML autocontenido con JavaScript y CSS inline que renderiza un modelo 3D mediante Three.js.
- Integracion de librerias desde CDN: carga Three.js y OrbitControls con version fijada desde cdnjs o jsDelivr.
- Generacion de codigo HTML/JavaScript: salida orientada a codigo funcional en un solo archivo.
- Conversacional: pipeline `text-generation` con soporte conversacional segun los tags del modelo.
- Control de escena 3D basico: zoom con rueda del raton y rotacion de camara con boton derecho, fondo blanco y ausencia de elementos adicionales de interfaz.
- Capacidades multilingues: limitadas al ingles declarado; no se documentan otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de assets 3D: un desarrollador describe un objeto (por ejemplo, una silla o un coche) y el modelo devuelve un HTML listo para abrir en el navegador, sin instalar Three.js ni configurar un entorno de build. Es adecuado por su salida autocontenida y el uso de CDN con version fijada.
- Demos interactivas para documentacion o presentaciones: generar visores 3D embebibles en una pagina web para mostrar productos o conceptos, aprovechando el control de camara por raton y el fondo blanco neutro.
- Generacion de maquetas para videojuegos o visualizacion cientifica: crear formas geometricas y composiciones simples como punto de partida, que luego se refinan manualmente en el HTML resultante.
- Educacion y ensenanza de programacion grafica: usar las salidas del modelo como ejemplos de codigo Three.js para explicar escenas, camaras, luces y controles en un curso.
- Pruebas de concepto en pipelines de contenido generativo: integrar el modelo en un flujo que recibe descripciones textuales y produce visores HTML para catalogos o configuradores de producto, con validacion posterior del codigo generado.
- Generacion de visualizaciones 3D para informes o dashboards: producir un HTML autonomo que represente datos o formas tridimensionales y pueda adjuntarse como artefacto estatico, sin dependencias de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,2 mil millones de parametros en precision completa (fp16) requiere aproximadamente 8-9 GB de VRAM solo para los pesos; la cuantizacion GGUF Q6_K reduce esta cifra de forma significativa.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: probable con la cuantizacion GGUF Q6_K en tarjetas con suficiente VRAM, aunque no se confirma en la documentacion disponible.
- Opciones de despliegue: llama.cpp u Ollama para el archivo GGUF Q6_K; vLLM o TGI para los pesos safetensors, aunque no se documenta compatibilidad explicita.
- Latencia y throughput: no disponible. El autor advierte que el modelo tiende a producir salidas largas, por lo que recomienda fijar un limite alto de `max_tokens`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mondk/Qwen3.5-4B-3D-Html | 4.205.751.296 | no disponible | Texto-a-3D via HTML/Three.js | apache-2.0 | Hugging Face (safetensors y GGUF Q6_K) |
| Qwen/Qwen3.5-4B (base) | 4B (aproximado) | no disponible | Proposito general | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en texto-a-3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para generar HTML con Three.js; fuera de ese dominio su comportamiento no esta documentado.
- Tiende a producir salidas largas; es necesario configurar un limite alto de `max_tokens`.
- Puede quedar atrapado en bucles al definir variables; el autor recomienda pausar la generacion e indicar al modelo que continue con la parte de construccion 3D.
- Puede cometer errores menores, como usar librerias obsoletas o secuencias incorrectas; conviene revisar y corregir el codigo generado.
- Idioma declarado unicamente ingles; el prompt de sistema esta en ingles y el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion en APIs de Three.js y en nombres de funciones o propiedades no verificadas; validar siempre el HTML resultante antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero requiere conservar los avisos de licencia y atribucion correspondientes.
- El autor advierte que el proyecto se actualizara lentamente y que el README fue traducido con Google Translate, por lo que puede haber partes poco claras.
- No se documentan sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mondk/Qwen3.5-4B-3D-Html
- Informe tecnico: https://huggingface.co/mondk/Qwen3.5-4B-3D-Html/blob/main/technical-report.pdf
- Cuantizacion GGUF Q6_K: https://huggingface.co/mondk/Qwen3.5-4B-3D-Html/blob/main/model-Q6_K.gguf
- Dataset Bench-3D.html: https://huggingface.co/datasets/mondk/Bench-3D.html
- Dataset 3D-By-Argon4: https://huggingface.co/datasets/noodcon/3D-By-Gemini4Argon
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
