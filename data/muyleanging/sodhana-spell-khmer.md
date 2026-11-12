# muyleanging/Sodhana-Spell-Khmer

## Resumen

Sodhana-Spell-Khmer es un anuncio de modelo (no un modelo entrenado) publicado por el desarrollador independiente Muyleang Ing en Hugging Face. Su objetivo es doble: correccion ortografica y autocompletado de texto en jemer (khmer), con un diseno pensado para ejecutarse en el propio dispositivo, integrado dentro del teclado Akkhara. El repositorio no contiene pesos: la model card indica explicitamente que se trata de un trabajo en curso y que las primeras versiones se publicaran cuando el modelo este entrenado y evaluado.

El modelo forma parte de una familia de utilidades para jemer del mismo autor: Sota (reconocimiento de voz), Chakkhu (OCR), Tossana (descripcion de imagenes), Akkhara (teclado) y VoxPocket (sintesis de voz). Sodhana comparte con Chakkhu y Sota el mismo tokenizador de 3.402 tokens de cluster jemer, lo que facilita la coherencia entre herramientas del ecosistema.

La relevancia actual es limitada: no hay artefactos descargables, ni arquitectura declarada, ni resultados de evaluacion. La ficha se limita a documentar el diseno previsto y las incognitas abiertas, sin extrapolar datos que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se ha declarado arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (exportacion ONNX prevista) |
| Idiomas soportados | jemer (km) |
| Licencia | sodhana-tbd (pendiente de decidir con la primera release; etiquetada como "other") |
| Formato de pesos | ONNX (int8) previsto; no hay pesos publicados |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura del modelo (transformer, MoE, SSM u otra). Tampoco detalla el numero de parametros, la longitud de contexto ni el volumen de datos de entrenamiento. Lo unico declarado es el pipeline (`text-generation`) y el uso previsto como corrector ortografico y autocompletador.

En cuanto al entrenamiento, el autor indica que se entrenara con texto jemer que contenga errores tipograficos y ortograficos realistas, y que se generaran pares de error-correccion. El tokenizador sera el mismo de 3.402 tokens de cluster jemer usado en Chakkhu y Sota. No se menciona RLHF, DPO ni ninguna innovacion tecnica adicional. La tabla de estado del repositorio marca los pares de error/correccion como "planned" y el primer modelo como "soon".

## Capacidades

- Correccion ortografica de texto en jemer (prevista).
- Autocompletado de siguiente palabra en jemer (previsto).
- Ejecucion en dispositivo mediante exportacion ONNX int8 (previsto).
- Integracion con el teclado Akkhara (previsto).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo jemer declarado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Correccion ortografica en el teclado Akkhara: el modelo se ejecutaria en el dispositivo para corregir en tiempo real lo que el usuario escribe en jemer, sin enviar texto a un servidor, lo que encaja con el objetivo declarado de "small enough to run inside the Akkhara keyboard".
- Autocompletado de siguiente palabra en aplicaciones de mensajeria: sugerir la palabra siguiente mientras se redacta en jemer, reduciendo pulsaciones en pantallas moviles.
- Procesamiento de texto jemer en local para editores: integracion via ONNX Runtime en editores de texto o suites ofimaticas que necesiten correccion sin conexion.
- Preprocesado para pipelines de PLN en jemer: normalizar texto con errores tipograficos antes de alimentar modelos de traduccion, resumen o analisis.
- Herramientas educativas de aprendizaje del jemer: resaltar errores ortograficos y sugerir correcciones a estudiantes.
- Filtrado y limpieza de corpus jemer: corregir de forma masiva texto de baja calidad recogido de foros o redes sociales antes de usarlo en otros entrenamientos.

En todos los casos, se trata de escenarios previstos a partir del diseno declarado; no hay artefactos publicados que permitan validarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (sin datos de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el objetivo declarado es ejecucion en dispositivo (CPU movil) mediante ONNX int8.
- Opciones de despliegue: ONNX Runtime (formato previsto); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni rendimiento del modelo, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de correccion ortografica en jemer. Los modelos de la misma familia del autor (Sota, Chakkhu, Tossana, Akkhara, VoxPocket) cubren tareas distintas y no son comparables en la tarea de correccion ortografica.

| Modelo | Tarea | Parametros | Contexto | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| Sodhana-Spell-Khmer | Correccion y autocompletado (jemer) | no disponible | no disponible | sodhana-tbd | No |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es utilizable en produccion ni en evaluacion.
- No se ha declarado la arquitectura, el tamano ni el contexto, lo que impide estimar requisitos de hardware.
- La licencia esta sin decidir ("sodhana-tbd"); no se puede asumir uso comercial hasta que el autor la concrete.
- El alcance linguistico declarado es unicamente jemer; no hay soporte multilingue.
- Al ser un modelo de correccion y generacion de texto, cabe esperar riesgo de alucinacion y de correcciones erroneas, aunque no hay evaluacion publicada que lo cuantifique.
- Los sesgos son desconocidos: no se ha publicado informacion sobre la composicion del corpus de entrenamiento.
- La fecha de creacion del repositorio (2026-11-12) y el estado "work in progress" indican que el proyecto esta en fase inicial.

## Enlaces

- Hugging Face: https://huggingface.co/muyleanging/Sodhana-Spell-Khmer
- Modelo de ASR de la misma familia (Sota): https://huggingface.co/muyleanging/Sota-ASR-Khmer-ONNX
- OCR de la misma familia (Chakkhu): https://muyleanging.github.io/chakkhu-web/
- Modelo de captioning de la misma familia (Tossana): https://huggingface.co/muyleanging/Tossana-Caption-Khmer
- Teclado de la misma familia (Akkhara): https://muyleanging.github.io/akkhara-web/
- Modelo TTS de la misma familia (VoxPocket): https://huggingface.co/muyleanging/VoxPocket-TTS-Khmer
