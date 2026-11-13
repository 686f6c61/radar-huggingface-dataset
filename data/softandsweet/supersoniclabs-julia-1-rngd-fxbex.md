# softandsweet/supersoniclabs-julia-1-rngd-fxbex

## Resumen

Julia-1 (variante `rngd-fxbex`) es un artefacto de clasificación de texto publicado por el usuario `softandsweet` en Hugging Face, derivado del checkpoint original `SupersonicLabs/Julia-1`. No se trata de un modelo de lenguaje generativo completo, sino de un "perfil de decisión" (`decision-model`) empaquetado en formato propietario `fxbx` para su ejecución sobre el stack Furiosa Torch/TCC 2026.4.0, orientado a aceleradores NPU de FuriosaAI. La model card está redactada en coreano y describe un caso de uso muy acotado: clasificar y puntuar opciones en consultas de facturación ("결제 문의의 선택과 확률을 표시합니다", es decir, mostrar la selección y la probabilidad de opciones en consultas de pago).

El modelo resuelve una tarea de clasificación de decisión con un contrato de entrada fijo: una pregunta, tres opciones y un total de 40 tokens en precisión FP32. Emplea el tokenizador oficial del checkpoint original Julia-1 y realiza la tokenización y la normalización de probabilidades en el host (CPU), delegando el cómputo al NPU. El repositorio ocupa 0,6 GB y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es limitada fuera del ecosistema Furiosa: se trata de una conversión de pesos más que de un modelo nuevo, con instrucciones de ejecución específicas (`fxbx run`, `fxbx predict`) y dependencias muy concretas (Torch 2.10.0+cpu, Transformers 5.20.2). Para desarrolladores e investigadores resulta útil únicamente como referencia de portabilidad de un clasificador a NPU, no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del checkpoint original Julia-1; no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 40 tokens en total (pregunta + tres opciones, según la model card) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye en FP32 según la model card) |
| Idiomas soportados | no disponible (la model card está en coreano; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.fxbx` (formato propietario del SDK fxbx); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base. Lo que sí se especifica es el proceso de conversión: se parte del checkpoint original `SupersonicLabs/Julia-1` (revisión `9c4e0c5870f7841fb74a23033eab723b3fea7bd7`) y de su tokenizador oficial, y se genera un perfil de decisión en FP32 con un presupuesto fijo de 40 tokens. No se indica si el modelo original fue entrenado con RLHF, DPO ni qué composición de datos utilizó; esa información no está disponible en el material proporcionado.

La innovación técnica destacable es la ruta de ejecución: el artefacto se ejecuta sobre Furiosa Torch/TCC 2026.4.0 con aceleración NPU. La model card reporta una traza oficial con 2.577 llamadas Runnable y 5.154 tareas NPU, sin ningún fallback a CPU del SDK. La validación numérica se realizó en el "RNGD número 5", donde la salida de facturación coincidió con la referencia de CPU y la diferencia absoluta máxima de probabilidad fue de 0,00000147. La tokenización y la normalización de probabilidades se ejecutan en el host, no en el acelerador. El artefacto incluye un hash SHA-256 de integridad (`f0d220719b0366e3ab301f5fdd8cfe765f2dc76a873e553805cef4e277d0ef43`).

## Capacidades

- Clasificación de texto con etiquetas de decisión: dada una pregunta y tres opciones, devuelve la opción seleccionada y su probabilidad.
- Salida calibrada en probabilidad: la model card reporta coincidencia con la referencia de CPU hasta 1,47e-06 de diferencia absoluta máxima.
- Ejecución en NPU de FuriosaAI mediante el SDK `fxbx`, con tokenización y normalización en host.
- Ejecución local desde fichero (`fxbx run ./Julia-1.fxbx`) o mediante predicción con entrada JSON (`fxbx predict ./Julia-1.fxbx --input inputs.json`).
- Diagnóstico del entorno mediante `fxbx doctor` (comprueba SDK y NPU).
- No se documentan capacidades de generación de texto libre, razonamiento multi-paso, código, matemáticas, visión, audio, tool calling ni agentes.
- No se documenta soporte multilingüe explícito; el caso de uso descrito es en coreano.

## Casos de uso

- Clasificación de consultas de facturación: el modelo recibe una pregunta y tres opciones predefinidas y devuelve la opción más probable con su puntuación, lo que permite enrutar tickets de pago hacia el flujo correcto. Es el caso descrito literalmente en la model card.
- Enrutamiento determinista en atención al cliente: al fijar tres opciones por consulta, la salida es acotada y auditable, lo que facilita integrarla en un sistema de triaje con reglas posteriores.
- Validación de portabilidad a NPU: sirve como banco de pruebas para verificar que un clasificador existente se ejecuta íntegramente en el acelerador (5.154 tareas NPU, cero fallbacks a CPU) antes de migrar cargas mayores.
- Pruebas de integridad de artefactos: el hash SHA-256 publicado permite verificar la descarga en pipelines de CI antes de desplegar el modelo en producción.
- Experimentación con el SDK fxbx: útil para equipos que evalúan Furiosa Torch/TCC 2026.4.0 y necesitan un ejemplo mínimo reproducible con dependencias fijadas (Torch 2.10.0+cpu, Transformers 5.20.2).
- Clasificación de opción única en formularios: con un contrato de 40 tokens, encaja en tareas donde la entrada ya está estructurada como pregunta más alternativas cerradas, sin necesidad de generar texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la diferencia absoluta máxima de probabilidad frente a la referencia de CPU (0,00000147) y el recuento de la traza de ejecución (2.577 llamadas Runnable, 5.154 tareas NPU, 0 fallbacks a CPU).

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto se ejecuta en NPU de FuriosaAI, no en GPU convencional.
- GPU recomendadas: no aplica según la model card; el stack declarado es Furiosa Torch/TCC 2026.4.0 con acelerador NPU.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ruta de ejecución en RTX 4090, A100 ni H100.
- Acelerador requerido: NPU de FuriosaAI (la validación se hizo en "RNGD número 5"); `fxbx doctor` permite comprobar SDK y NPU.
- Opciones de despliegue: SDK `fxbx` instalado desde el repositorio Git fijado (`smallstep-zzz/fxbX` en el commit `790106499cc0767e73637e1cbb84ad1c07e8e851`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reporta el número de tareas NPU por ejecución (5.154), sin medida temporal.
- Dependencias de software: Python con `fxbx[weights]`, Torch 2.10.0+cpu y Transformers 5.20.2.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de decisión empaquetados para NPU) ni datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Alcance muy restringido: el contrato de entrada es una pregunta con tres opciones y un total de 40 tokens; entradas más largas requieren recortar la pregunta o las descripciones, según la propia model card.
- No es un modelo generativo: no produce texto libre, código ni razonamiento; etiquetarlo como "modelo de lenguaje" induciría a error.
- Dependencia de un formato y SDK propietarios (`.fxbx`, `fxbx`), lo que limita la portabilidad y ata el despliegue a una versión concreta del stack Furiosa.
- Dependencias de software muy específicas y recientes (Torch 2.10.0+cpu, Transformers 5.20.2, Furiosa Torch/TCC 2026.4.0); cambios de versión pueden romper la ejecución.
- Idiomas soportados no declarados: no hay garantía de comportamiento fuera del coreano, idioma del caso de uso descrito.
- Sin datos de entrenamiento, sesgos ni evaluación de alucinación publicados; al ser un clasificador de opciones cerradas, el riesgo de alucinación se limita a una asignación errónea de probabilidad entre las tres alternativas.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del checkpoint original `SupersonicLabs/Julia-1` debería verificarse por separado antes de un despliegue en producción.
- Repositorio sin descargas ni interacciones y con autor no verificado (`softandsweet`): no hay evidencia de comunidad ni de mantenimiento.
- La model card está en coreano y no incluye evaluación independiente; la única validación numérica es la del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/softandsweet/supersoniclabs-julia-1-rngd-fxbex
- Checkpoint original: https://huggingface.co/SupersonicLabs/Julia-1/tree/9c4e0c5870f7841fb74a23033eab723b3fea7bd7
- Repositorio del SDK fxbx: https://github.com/smallstep-zzz/fxbX (commit `790106499cc0767e73637e1cbb84ad1c07e8e851`)
- Ejemplo de entrada: `sample.json` en el repositorio del modelo
