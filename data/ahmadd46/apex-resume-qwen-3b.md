# ahmadd46/apex-resume-qwen-3b

## Resumen

Apex Resume Qwen-3B es un modelo de lenguaje de 3 mil millones de parámetros, desarrollado por ahmadd46, que consiste en un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct mediante LoRA. Su propósito es la adaptación honesta de currículums y cartas de presentación a ofertas de empleo específicas, priorizando la experiencia verificable y el lenguaje de la oferta sin inventar información. Forma parte del proyecto Apex Hunter, una herramienta de asistencia profesional local-first que garantiza que los datos no salgan del equipo del usuario.

El modelo está cuantizado en formato GGUF (Q4_K_M) y pesa aproximadamente 1,8 GB, lo que permite su ejecución en hardware de consumo modesto mediante Ollama o llama.cpp. Su principal innovación es la restricción de honestidad: no fabrica habilidades, cargos, empleadores, fechas ni métricas, y enmarca la experiencia transferible como adyacencia honesta, nunca como dominio completo. Está diseñado para que el currículum resultante sea defendible en una entrevista.

La relevancia actual de este modelo radica en la creciente demanda de herramientas de búsqueda de empleo que operen localmente, sin depender de APIs externas, y que prioricen la veracidad frente a la exageración típica de los generadores automáticos de currículums. Al estar basado en Qwen2.5-3B-Instruct, hereda una arquitectura transformer eficiente y una licencia Apache-2.0, lo que facilita su uso comercial y su integración en flujos de trabajo personales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, 36 capas, hidden size 2048) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B-Instruct soporta 32K tokens, pero no se confirma en la ficha del fine-tune) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo .gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, que emplea la arquitectura Qwen2: un transformer decoder-only con 36 capas y un tamaño de ocultación de 2048. El ajuste fino se realizó mediante LoRA sobre un conjunto curado de ejemplos de adaptación de currículums, y posteriormente los pesos LoRA se fusionaron con los pesos base. No se menciona el uso de RLHF ni DPO; el entrenamiento se centra en ejemplos supervisados de reformulación y priorización de contenido profesional.

El proceso de cuantización a GGUF Q4_K_M reduce el tamaño del modelo a aproximadamente 1,8 GB, optimizándolo para inferencia local eficiente con llama.cpp y Ollama. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, pero la model card indica que se trata de ejemplos de "resume-tailoring" (adaptación de currículums) con énfasis en la honestidad y la trazabilidad de la información.

## Capacidades

- Adaptación de currículums: reescribe y prioriza el contenido del currículum de una persona para una oferta específica, liderando con la experiencia más relevante y verificada.
- Redacción de cartas de presentación: genera cartas personalizadas que reflejan la experiencia real del candidato y el lenguaje de la oferta.
- Restricción de honestidad: no fabrica habilidades, cargos, empleadores, fechas ni métricas; toda afirmación se basa en el perfil proporcionado.
- Enmarcado de experiencia transferible: presenta habilidades transferibles como adyacencia honesta, no como dominio completo.
- Funcionamiento local: no requiere conexión a internet ni APIs externas; los datos permanecen en el equipo del usuario.
- Generación de texto en inglés: limitado al idioma inglés, según la etiqueta `language: en`.

## Casos de uso

- Adaptación de currículum a una oferta concreta: el candidato introduce su experiencia real y la descripción del puesto; el modelo reordena y reformula las secciones para destacar lo más relevante, usando el vocabulario de la oferta sin inventar logros.
- Redacción de cartas de presentación personalizadas: a partir de un perfil y una oferta, el modelo genera una carta que conecta la experiencia del candidato con los requisitos del puesto, manteniendo un tono profesional y verificable.
- Preparación de entrevistas: tras adaptar el currículum, el candidato puede usar el modelo para generar posibles preguntas basadas en el contenido adaptado, asegurando que puede defender cada afirmación.
- Revisión de coherencia y honestidad: el modelo puede revisar un currículum existente para detectar posibles exageraciones o inconsistencias, sugiriendo reformulaciones más defensibles.
- Asistencia a profesionales con datos sensibles: personas que manejan información confidencial (por ejemplo, empleados de sectores regulados) pueden adaptar sus currículums sin enviar datos a servicios en la nube, gracias al funcionamiento local.
- Integración en pipelines de búsqueda de empleo: desarrolladores pueden incorporar el modelo en herramientas de automatización personal (como Apex Hunter) para generar versiones de currículum por oferta, ejecutándose en segundo plano con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de adaptación de currículums. Se recomienda evaluar el modelo en casos de uso reales antes de adoptarlo en producción.

## Requisitos de hardware

- Almacenamiento: aproximadamente 1,8 GB para el archivo GGUF Q4_K_M.
- VRAM estimada: entre 2 y 3 GB para inferencia en GPU con cuantización Q4_K_M; puede ejecutarse en CPU con 8 GB de RAM si se usa llama.cpp con offloading parcial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como GTX 1060 6GB, RTX 2060, RTX 3060, o superiores. También funciona en Apple Silicon con Metal.
- Opciones de despliegue: Ollama (comando `ollama run hf.co/ahmadd46/apex-resume-qwen-3b:Q4_K_M`), llama.cpp (`llama-cli`), o mediante bindings de Python como llama-cpp-python.
- Latencia y throughput: no disponibles; al ser un modelo de 3B cuantizado, se espera una generación de varios tokens por segundo en hardware de consumo, pero no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se han identificado modelos fine-tuned específicamente para adaptación honesta de currículums con licencia Apache-2.0 y formato GGUF. Como referencia, se comparan el modelo base y alternativas genéricas de 3B:

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Apex Resume Qwen-3B | 3B | No disponible (base: 32K) | Apache-2.0 | GGUF | Adaptación honesta de currículums |
| Qwen2.5-3B-Instruct | 3B | 32K | Apache-2.0 | Safetensors, GGUF | Instrucciones generales, chat |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community | Safetensors, GGUF | Instrucciones generales, multilingüe |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | Safetensors, GGUF | Razonamiento, instrucciones |

La comparación muestra que Apex Resume es un fine-tune especializado, mientras que las alternativas son modelos generalistas. No hay competidores directos en el nicho de honestidad para currículums con estas características.

## Limitaciones y advertencias

- Idioma: solo soporta inglés; no es adecuado para currículums en español u otros idiomas.
- Tamaño reducido: al ser un modelo de 3B, puede generar respuestas menos matizadas que modelos más grandes; se recomienda revisar siempre la salida.
- Riesgo de alucinación: aunque está entrenado para no inventar, ningún modelo es infalible; el usuario debe verificar que toda afirmación se corresponda con su experiencia real.
- Uso previsto: exclusivamente para asistir a una persona real en la adaptación de su propio currículum; no debe usarse para generar experiencia ficticia, suplantación de identidad o envío masivo de solicitudes automatizadas.
- Dependencia del contexto: el modelo requiere un perfil claro y una descripción de puesto específica para funcionar correctamente; con entradas vagas puede producir resultados poco útiles.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar los términos de la licencia del modelo base Qwen2.5-3B-Instruct y las condiciones de uso de los pesos cuantizados.
- Sin garantías de producción: no se han publicado benchmarks ni evaluaciones de robustez; para entornos críticos se debe realizar una validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmadd46/apex-resume-qwen-3b
- Repositorio de Apex Hunter: https://github.com/ahmadkhan46/Apex-Hunter
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
