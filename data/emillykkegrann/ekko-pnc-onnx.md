# emillykkegrann/ekko-pnc-ONNX

## Resumen

ekko-pnc-ONNX es un espejo no modificado de los ficheros ONNX en cuantización int8 del modelo RyeAI/ekko-pnc, desarrollado originalmente por RyeAI. Se trata de un modelo de tipo Electra orientado a dos tareas de etiquetado de tokens (token classification): la restauración de puntuación y el truecasing (recuperación de mayúsculas y minúsculas) en texto en danés. El espejo lo publica el desarrollador emillykkegrann para que el proyecto Codictate pueda añadir puntuación y mayúsculas a dictados en danés sin depender de que el repositorio original permanezca inalterado.

El modelo no genera texto libre: recibe una secuencia de tokens sin puntuación ni mayúsculas y predice, token a token, la clase correspondiente (signo de puntuación y capitalización). Es, por tanto, una pieza de preprocesado o postprocesado dentro de pipelines de ASR (reconocimiento automático del habla) o de normalización de texto, y no un modelo conversacional.

La relevancia del artefacto es fundamentalmente práctica: ofrece los pesos en formato ONNX int8 (un único fichero de unos 22,4 MB) listos para inferencia en runtime ONNX, con licencia CC BY 4.0 y las restricciones adicionales de la licencia CoRal que se detallan en el repositorio original. No se han publicado en la información disponible datos sobre arquitectura interna más allá de la familia Electra, ni sobre el número de parámetros, contexto o composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Electra (según tag `electra`); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX); el repositorio original ofrece exportación FP32 |
| Idiomas soportados | danés (`da`) |
| Licencia | CC BY 4.0, sujeta a las restricciones de CoRal (sección 4 de `LICENSES/CORAL-LICENSE`) |
| Formato de pesos | ONNX (`pnc.int8.onnx`, 22.424.741 bytes) más `tokenizer.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Electra, según la etiqueta declarada en el repositorio, y está configurado para la tarea de token classification con dos objetivos combinados: restauración de puntuación y truecasing. El artefacto publicado aquí es únicamente la exportación int8 a ONNX; no incluye información sobre el proceso de entrenamiento, el número de tokens vistos, la composición del corpus ni si se aplicaron técnicas de ajuste fino adicionales. El autor del espejo remite explícitamente al repositorio original RyeAI/ekko-pnc para los detalles de entrenamiento y evaluación, y advierte de que el fichero `calibration.json` no se ha replicado porque ya está incorporado en los pesos de `pnc.int8.onnx`.

La innovación técnica del artefacto es la propia cuantización int8 exportada a ONNX, que reduce el modelo a un fichero de 22,4 MB apto para inferencia en CPU o en entornos con recursos limitados, sin necesidad de framework de deep learning pesado. No se dispone de información sobre decodificación especulativa, atención lineal ni otras optimizaciones de arquitectura.

## Capacidades

- Restauración de puntuación en texto danés: inserta signos de puntuación (puntos, comas, interrogaciones, etc.) en secuencias que carecen de ellos.
- Truecasing: recupera mayúsculas y minúsculas correctas en texto escrito íntegramente en minúsculas o sin capitalización.
- Etiquetado de tokens (token classification) a nivel de token, adecuado para postprocesado de transcripciones ASR.
- Ejecución mediante runtime ONNX, sin dependencia de PyTorch o TensorFlow en producción.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.
- Capacidad multilingüe limitada al danés; no se declaran otros idiomas.

## Casos de uso

- Postprocesado de dictado por voz en danés: el modelo recibe la transcripción cruda del ASR (sin puntuación ni mayúsculas) y devuelve el texto puntuado y capitalizado, integrándose en la aplicación Codictate tal como describe el autor del espejo.
- Normalización de subtítulos automáticos: se aplica sobre las salidas de un sistema de reconocimiento del habla para generar subtítulos legibles con puntuación y mayúsculas correctas, gracias al reducido tamaño del modelo int8.
- Preprocesado de corpus daneses: limpieza y estandarización de textos sin puntuar procedentes de foros, chats o transcripciones antes de indexarlos o analizarlos.
- Pipelines de accesibilidad: conversión de transcripciones en bruto a texto legible para lectores de pantalla o sistemas de texto a voz, donde la puntuación afecta a la prosodia.
- Procesamiento en el dispositivo (edge): al ser un ONNX int8 de 22,4 MB, puede ejecutarse en CPU de portátiles o dispositivos móviles sin GPU, útil en aplicaciones de dictado offline.
- Integración en herramientas de documentación clínica o legal en danés: postprocesado de notas dictadas para obtener texto con formato correcto antes de su revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo int8 de 22,4 MB puede ejecutarse en CPU. En GPU, el consumo de memoria es marginal (del orden de decenas de MB, sin cifra oficial disponible).
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime es suficiente, y no es necesario hardware de datacenter (A100, H100) para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con soporte ONNX Runtime, aunque su uso típico es en CPU.
- Opciones de despliegue: ONNX Runtime (principal), con posibilidad de conversión a otros runtimes compatibles con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emillykkegrann/ekko-pnc-ONNX | Electra (token classification) | danés | ONNX int8 | CC BY 4.0 + restricciones CoRal | HuggingFace, 42 descargas |
| RyeAI/ekko-pnc (original) | Electra (token classification) | danés | FP32 (y exportación int8) | CC BY 4.0 + restricciones CoRal | HuggingFace |
| Alternativas de restauración de puntuación para otras lenguas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de restauración de puntuación y truecasing en danés con la que construir una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo solo cubre danés; no es utilizable para castellano ni otras lenguas sin reentrenamiento.
- Es un espejo no modificado: cualquier error o sesgo del modelo original se reproduce íntegramente aquí.
- La licencia CC BY 4.0 está sujeta a las restricciones de la licencia CoRal (sección 4 de `LICENSES/CORAL-LICENSE`), que pueden limitar ciertos usos; es imprescindible revisar `MODEL_LICENSE.md`, `NOTICE` y `LICENSES/` antes de un uso comercial.
- No se han publicado métricas de evaluación en la información disponible; no hay garantía documentada sobre la precisión de la puntuación o el truecasing en dominios distintos del corpus de entrenamiento.
- Riesgo de errores en textos con jerga, nombres propios o estructuras atípicas, propio de los modelos de etiquetado de tokens; se recomienda validación humana en contextos sensibles (clínico, legal).
- El repositorio tiene un tamaño declarado de 0.0 GB y solo 42 descargas, lo que sugiere escasa validación por parte de la comunidad.
- El autor del espejo se compromete a retirarlo si RyeAI lo solicita; la disponibilidad a largo plazo no está garantizada.

## Enlaces

- Repositorio del espejo: https://huggingface.co/emillykkegrann/ekko-pnc-ONNX
- Modelo original: https://huggingface.co/RyeAI/ekko-pnc
- Proyecto Codictate: https://github.com/EmilLykke/codictate
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Organización RyeAI: https://huggingface.co/RyeAI
