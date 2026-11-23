# anthian/salamandra-2b-instruct-Q4_K_M-gguf

## Resumen

Salamandra-2b-instruct-Q4_K_M-gguf es una cuantización en formato GGUF del modelo BSC-LT/salamandra-2b-instruct, publicada por el usuario anthian. El modelo base es un transformer decoder-only de 2.253.490.176 parámetros (aproximadamente 2,25 mil millones) desarrollado por el Barcelona Supercomputing Center (BSC-LT) y orientado a generación de texto conversacional, con especial atención al catalán. Esta versión concreta aplica cuantización Q4_K_M para reducir el peso del repositorio a 1,5 GB, lo que facilita su despliegue en hardware modesto.

El interés de esta ficha radica en que combina un modelo institucional europeo con licencia Apache 2.0 y una cuantización de 4 bits lista para inferencia local. La model card del autor es mínima: solo declara la licencia, el dataset de ajuste (projecte-aina/UD_Catalan-AnCora), el idioma (catalán) y el modelo base. No se documentan datos de entrenamiento, benchmarks ni detalles de la cuantización más allá del nombre del fichero.

La relevancia actual es doble: por un lado, ofrece una vía práctica para ejecutar un modelo de 2B en CPU o GPUs de consumo; por otro, ilustra el ecosistema de cuantizaciones comunitarias sobre modelos institucionales, con las limitaciones de trazabilidad que ello implica. No se dispone de información sobre el proceso de ajuste instruccional del modelo base ni sobre el pipeline exacto de cuantización empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base; no se detalla en la model card) |
| Parametros totales | 2.253.490.176 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 1,5 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base BSC-LT/salamandra-2b-instruct, un transformer decoder-only de aproximadamente 2,25 mil millones de parámetros. La model card de esta cuantización no aporta detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni vocabulario. Tampoco se documenta si el modelo base emplea técnicas como atención lineal, decodificación especulativa o mezcla de expertos; los datos disponibles no permiten confirmarlo.

Respecto al entrenamiento, la única información declarada es que el modelo se generó con la librería TRL (`generated_from_trainer`) y que se usó el dataset projecte-aina/UD_Catalan-AnCora, un corpus de dependencias sintácticas del catalán. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. La cuantización Q4_K_M se aplicó presumiblemente sobre los pesos del modelo base, pero no se documenta la herramienta ni los parámetros exactos del proceso.

## Capacidades

- Generación de texto conversacional en catalán, según la etiqueta `conversational` y el pipeline `text-generation`.
- Ajuste instruccional heredado del modelo base `BSC-LT/salamandra-2b-instruct`, aunque no se detallan las tareas concretas cubiertas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara catalán; no se confirman otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistentes conversacionales en catalán: el modelo puede gestionar diálogos multi-turno en catalán gracias a su ajuste instruccional y a la etiqueta `conversational`; la cuantización Q4_K_M permite ejecutarlo en entornos con recursos limitados.
- Procesamiento de textos administrativos catalanes: útil para resumir, reformular o clasificar documentación en catalán, aprovechando el corpus AnCora como referencia lingüística del ajuste.
- Prototipado rápido en local: al pesar 1,5 GB en GGUF, se puede cargar en portátiles con 8-16 GB de RAM para pruebas de generación de texto sin depender de infraestructura cloud.
- Educación y divulgación lingüística: permite demostrar el funcionamiento de modelos de lenguaje en catalán en talleres o entornos docentes con hardware de consumo.
- Generación de borradores de contenido en catalán: artículos, correos o respuestas a preguntas frecuentes, con revisión humana posterior dado el riesgo de alucinación.
- Integración en pipelines de CI para pruebas de regresión lingüística: sirve como modelo de referencia ligero para validar salidas en catalán en entornos de integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 1,5-2,5 GB, incluyendo pesos y overhead de contexto, según la implementación.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); en A100 o H100 funcionaría pero estaría infrautilizada.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más de VRAM; también puede ejecutarse en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama (tras importar el GGUF), y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponible; dependerá del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| anthian/salamandra-2b-instruct-Q4_K_M-gguf | 2,25 B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| BSC-LT/salamandra-2b-instruct | 2,25 B | no disponible | Apache 2.0 | safetensors (presumible) | Hugging Face |
| Salamandra-2b (base, sin instruct) | 2,25 B | no disponible | Apache 2.0 | safetensors (presumible) | Hugging Face |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no documenta datos de entrenamiento, benchmarks ni el proceso de cuantización, lo que dificulta evaluar su calidad de forma rigurosa.
- Riesgo de alucinación inherente a modelos de 2B, especialmente en tareas de conocimiento factual.
- Idioma limitado al catalán según la etiqueta; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto desconocida; no se debe asumir una ventana amplia para conversaciones largas o documentos extensos.
- La licencia Apache 2.0 permite uso comercial, pero al ser una cuantización comunitaria conviene verificar la procedencia y la integridad de los pesos antes de usarla en producción.
- El dataset de ajuste declarado (UD_Catalan-AnCora) es de dependencias sintácticas, lo que puede no reflejar la distribución de tareas conversacionales reales.
- Sin datos de sesgos conocidos; se recomienda auditoría propia antes de desplegar en aplicaciones sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anthian/salamandra-2b-instruct-Q4_K_M-gguf
- Modelo base: https://huggingface.co/BSC-LT/salamandra-2b-instruct
- Dataset de ajuste: https://huggingface.co/datasets/projecte-aina/UD_Catalan-AnCora
- Librería TRL: https://github.com/huggingface/trl
