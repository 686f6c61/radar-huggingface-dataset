# Mintaservices/Mande-IA

## Resumen

Mande-IA v5 es un modelo de lenguaje publicado por Minta Services, una empresa con sede en Malí, bajo la dirección del Profesor Issa Minta. Se presenta como un modelo "soberano" orientado específicamente a la comprensión y generación de texto en bamanankan (bambara), francés e inglés, con especial énfasis en la calidad del bambara frente a las traducciones literales desde el francés. La model card indica que sigue las normas ortográficas del DNAFLA (Direction Nationale de l'Alphabétisation Fonctionnelle et de la Linguistique Appliquée).

El modelo se distribuye en formato GGUF y está integrado en el ecosistema de Ollama mediante el repositorio `hf.co/Professor-minta/Mande-IA-v5-GGUF`. La propuesta de valor se centra en la ejecución local (privacidad de datos) y en su alineación con los programas de formación de Minta Academy, así como en su uso como asistente web y en WhatsApp.

La información pública disponible es muy limitada: no se especifican arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento. El repositorio de Hugging Face acumula cero descargas y cero likes en el momento de la consulta, y la model card no incluye resultados de benchmarks ni detalles técnicos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | bamanankan (bambara), frances, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con Modelfile incluido para Ollama) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (tipo de transformer, número de capas, dimensiones ocultas, mecanismos de atención ni si emplea técnicas como MoE o atención lineal). Tampoco se detallan el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

La model card menciona únicamente que el modelo fue entrenado sobre "estructuras de frases auténticas" en bamanankan, respetando la gramática y las normas oficiales del DNAFLA, y que evita el enfoque de traducción palabra por palabra desde el francés. Se incluye un Modelfile con temperatura recomendada de 0.3 para obtener respuestas "óptimas y estables", lo que sugiere un ajuste orientado a la generación determinista más que a la creatividad.

## Capacidades

- Generación de texto en bamanankan, francés e inglés.
- Asistencia conversacional multi-turno (según la descripción del producto en ia.mintaservices.com).
- Redacción y escritura en los tres idiomas soportados.
- Uso como asistente en interfaz web y en WhatsApp (según el repositorio de GitHub).
- Ejecución local con Ollama mediante GGUF, con prompt de sistema configurable vía Modelfile.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Atención al cliente en bambara y francés: el modelo puede gestionar conversaciones en bamanankan para usuarios malineses que no dominan el francés, reduciendo la dependencia de traductores intermedios y preservando la gramática DNAFLA.
- Asistente educativo para Minta Academy: integración en los programas de formación técnica de la academia para responder dudas en francés y bambara, con ejecución local que evita costes de API.
- Despliegue en WhatsApp: el repositorio de GitHub documenta un asistente para WhatsApp; el modelo puede servir como backend de respuestas en conversaciones de mensajería en los tres idiomas soportados.
- Traducción y redacción asistida francés-bambara: útil para organizaciones locales que necesitan adaptar comunicaciones oficiales al bambara con estructuras gramaticales nativas en lugar de calcos del francés.
- Procesamiento de texto con privacidad: al ejecutarse localmente vía Ollama, es adecuado para entornos con datos sensibles (salud, administración) que no pueden enviarse a servicios en la nube.
- Prototipado rápido en entornos con recursos limitados: el formato GGUF permite probar el modelo en portátiles y estaciones de trabajo sin GPU dedicada, aunque no se dispone de cifras de rendimiento para confirmar latencias.
- Presencia digital para pymes malinesas: generación de contenido web y redes sociales en francés y bambara para negocios locales, con la ventaja de la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (depende del tamaño del modelo, que no se especifica).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato GGUF sugiere que puede ejecutarse en CPU y en GPU de consumo, pero sin datos de tamaño no puede verificarse.
- Opciones de despliegue: Ollama (soporte oficial vía Hugging Face: `ollama run hf.co/Professor-minta/Mande-IA-v5-GGUF:mande-ia-v5-entraine.gguf`); llama.cpp es compatible por el formato GGUF. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre arquitectura ni parámetros que permita identificar modelos comparables de la misma categoría o tamaño. Como referencia cualitativa, existen otros modelos multilingües con soporte de lenguas africanas (por ejemplo, iniciativas como Masakhane o modelos de Lelapa AI), pero no se han proporcionado datos que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros ni contexto publicados, es imposible evaluar su idoneidad para producción o estimar costes de inferencia.
- Sin benchmarks ni evaluación independiente: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni en tareas específicas de bambara.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de alineación (RLHF/DPO) documentados, el riesgo no puede acotarse.
- Sesgos: no documentados; un corpus centrado en Malí y en la normativa DNAFLA puede introducir sesgos regionales o dialectales dentro del propio bambara.
- Cobertura limitada de idiomas: solo bamanankan, francés e inglés; no se declara soporte para otras lenguas de Malí (fulfulde, songhay, tamasheq).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la ausencia de información sobre el origen de los datos de entrenamiento impide verificar el cumplimiento de derechos de autor.
- Madurez del proyecto: cero descargas y cero likes en Hugging Face en la fecha de consulta; el proyecto parece en fase inicial, con documentación escasa y sin métricas de adopción.
- Fecha de creación del repositorio (2026-11-08) posterior a la fecha habitual de consulta, lo que sugiere posibles inconsistencias en los metadatos de la plataforma.

## Enlaces

- Hugging Face: https://huggingface.co/Mintaservices/Mande-IA
- Repositorio GGUF en Ollama/Hugging Face: https://huggingface.co/Professor-minta/Mande-IA-v5-GGUF
- Interfaz web de Mande-IA: https://ia.mintaservices.com/
- Repositorio GitHub: https://github.com/Professor-minta/Mande-IA/tree/main
- Sitio web de Minta Services: https://mintaservices.com
- Contacto: contact@mintaservices.com / professorminta@gmail.com
