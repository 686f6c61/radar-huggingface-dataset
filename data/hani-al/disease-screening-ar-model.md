# Hani-al/disease-screening-ar-model

## Resumen

Disease Screening AR Model es un repositorio alojado en Hugging Face por el usuario Hani-al que se presenta como una "tarjeta de entrega" (بطاقة تسليم) de la interfaz de una aplicación de cribado de enfermedades en árabe. Según su propia model card, no contiene pesos de aprendizaje automático ni constituye un dispositivo médico: es un artefacto documental y operativo asociado a un Space de demostración interactiva denominado Disease Screening AR.

El artefacto recibe síntomas y mediciones introducidas por el usuario y devuelve un resultado orientativo revisable. La model card insiste en que dicho resultado no sustituye la consulta médica ni los servicios de emergencia, y clasifica la herramienta como válida para experimentación y docencia, pero no apta para uso clínico en producción sin revisión clínica, controles de privacidad y cifrado.

Por tanto, no se trata de un modelo fundacional ni de un modelo de lenguaje entrenado: la información disponible no describe arquitectura, parámetros, contexto ni proceso de entrenamiento. Su relevancia es la de un ejemplo de empaquetado de aplicación sanitaria en el ecosistema Hugging Face Spaces, con advertencias explícitas sobre sus límites.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio se describe como interfaz de aplicación, no como modelo de aprendizaje automático) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | árabe (ar) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se declaran pesos; librería `custom`) |

## Arquitectura y entrenamiento

La información proporcionada no describe ninguna arquitectura de red neuronal, ni datos de entrenamiento, ni número de tokens, ni fases de RLHF o DPO. La model card define el repositorio como una tarjeta de entrega y un repositorio documental y operativo de la interfaz de la aplicación, y afirma explícitamente que no contiene pesos de aprendizaje automático.

El pipeline declarado es `other` y la librería es `custom`, lo que concuerda con un artefacto de aplicación más que con un modelo. No hay innovaciones técnicas documentadas (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Recepción de síntomas y mediciones introducidas por el usuario a través de una interfaz interactiva.
- Devolución de un resultado orientativo y revisable, según la descripción de la model card.
- Validación de entrada: la model card indica que se comprobó la aparición de la alerta ante entradas incompletas.
- Idiomas: árabe.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documenta generación de texto libre, código ni matemáticas.

## Casos de uso

- Demostración docente de cribado orientativo: el Space puede abrirse para ilustrar cómo una interfaz recoge síntomas y mediciones y devuelve una orientación revisable, siempre con la advertencia de que no sustituye al médico.
- Prueba de concepto de aplicación sanitaria en árabe: sirve como base para evaluar flujos de entrada de datos clínicos y mensajes de resultado en ese idioma antes de construir un sistema real.
- Validación de experiencia de usuario en formularios clínicos: la comprobación descrita de campos de entrada, botón de análisis y alertas por entrada incompleta permite usar el artefacto para probar patrones de validación de formularios.
- Referencia de entrega documental: el repositorio puede usarse como plantilla de "tarjeta de entrega" que documente qué se ha probado y qué falta para producción (autenticación, base de datos segura, registro de auditoría, pruebas automatizadas).
- Formación en límites de seguridad clínica: ejemplifica cómo declarar de forma explícita que una herramienta no es un dispositivo médico y que requiere revisión de especialistas.
- Integración en un Space de demostración: al estar vinculado a un Space público, puede enlazarse desde documentación o materiales de curso para mostrar el ciclo completo de publicación de una demo sanitaria en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no declararse pesos ni arquitectura.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica que se abra el enlace del Space; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Para un uso en producción, la model card exige autenticación, base de datos segura, registro de auditoría, pruebas automatizadas y revisión por especialistas.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría, y el artefacto no declara parámetros, contexto ni métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card afirma que el resultado no debe usarse en lugar del médico ni de los servicios de emergencia.
- No es apto para uso clínico en producción sin revisión clínica, controles de privacidad y cifrado.
- No contiene pesos de aprendizaje automático según su propia descripción; no debe tratarse como un modelo entrenado.
- Licencia no disponible: no se puede confirmar si se permite uso comercial.
- Idioma limitado al árabe según la etiqueta de idioma declarada.
- Riesgo de interpretación errónea por parte del usuario final si se presenta como herramienta diagnóstica; la model card insiste en el carácter orientativo y revisable.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluable, al no tratarse de un modelo generativo según la información disponible.
- Requisitos pendientes para producción según el autor: autenticación, base de datos segura, registro de auditoría, pruebas automatizadas y revisión por especialistas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hani-al/disease-screening-ar-model
- Space de demostración: https://huggingface.co/spaces/Hani-al/disease-screening-ar
