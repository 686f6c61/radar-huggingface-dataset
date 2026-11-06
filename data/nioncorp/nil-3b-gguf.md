# nioncorp/nil-3b-gguf

## Resumen

`nil-3b` es un modelo de lenguaje de 3.000 millones de parámetros desarrollado por Nion Technologies, Inc. (Nion Intelligence Labs) a partir de un ajuste fino de `meta-llama/Llama-3.2-3B-Instruct`. Se distribuye exclusivamente en formato GGUF cuantizado a `q4_k_m`, con un peso de fichero de 1,8 GB, y está diseñado para despliegues soberanos y completamente offline en hardware de bajas prestaciones (ARM Cortex-A72, dispositivos portátiles y equipos de baja potencia) en entornos africanos con conectividad limitada o nula.

La propuesta del modelo es la inferencia local sin dependencias de nube ni llamadas de red externas, con una huella de memoria operativa declarada inferior a 120 MB y una latencia de aproximadamente 38 ms por inferencia en hardware ARM de consumo. El autor declara un ajuste fino orientado a 32 lenguas y dialectos africanos, así como a contextos regionales de política y salud, aunque la model card solo enumera seis idiomas en sus metadatos.

Es relevante ahora por la creciente demanda de modelos pequeños, cuantizados y desplegables en el borde para escenarios de privacidad estricta y conectividad intermitente, donde un modelo de 3B en 1,8 GB puede ejecutarse en dispositivos que no admiten alternativas de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 3B Instruct; detalles específicos del ajuste no disponibles) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 3B Instruct soporta 128k tokens, pero el autor no lo confirma para este ajuste) |
| Tipos de cuantizacion | GGUF `q4_k_m` (1,8 GB); no se documentan otras variantes |
| Idiomas soportados | en, sw, am, ha, yo, ig (metadatos); el autor declara ajuste fino sobre 32 lenguas y dialectos africanos |
| Licencia | MIT |
| Formato de pesos | GGUF (destinado a llama.cpp / llama-cpp-python) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only de 3B parámetros con atención por grupos (GQA) y tokenizador BPE de Llama 3. Sobre esa base, Nion Technologies aplica un ajuste fino orientado a dominios regionales (política y salud) y a un conjunto amplio de lenguas africanas. La model card no especifica el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de alineación adicionales como RLHF o DPO tras el ajuste supervisado.

La innovación principal no está en la arquitectura, sino en el empaquetado: cuantización `q4_k_m` hasta 1,8 GB, una asignación de RAM operativa declarada inferior a 120 MB y optimización para inferencia en CPU ARM (Cortex-A72). El modelo está pensado para ejecutarse con llama.cpp / llama-cpp-python sin acceso a red, lo que encaja con el etiquetado `sovereign-ai` y `offline-ai` del repositorio. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional e instruccional, heredada del ajuste Instruct de Llama 3.2 3B.
- Comprensión y generación multilingüe en inglés, suajili, amárico, hausa, yoruba e igbo según los metadatos, con cobertura declarada de hasta 32 lenguas y dialectos africanos.
- Adaptación a contextos regionales de política y salud pública.
- Inferencia totalmente offline, sin llamadas externas ni telemetría de red.
- Ejecución en hardware de bajas prestaciones (ARM Cortex-A72, wearables, dispositivos de baja potencia).
- Soporte de tool calling / function calling: no disponible (no documentado por el autor).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo thinking, visión o audio: no disponible (modelo solo texto).

## Casos de uso

- Asistencia sanitaria en zonas sin conectividad: el modelo puede responder consultas básicas de salud pública en lenguas locales sobre dispositivos ARM de bajo consumo, con inferencia local y sin exponer datos del paciente a la red.
- Orientación política y administrativa regional: despliegue en oficinas locales o quioscos para resolver dudas sobre trámites y políticas en suajili, hausa o yoruba, aprovechando el ajuste declarado sobre contextos regulatorios africanos.
- Educación rural offline: instalación en dispositivos portátiles o wearables para tutoría básica en inglés y lenguas locales, sin depender de conexión a internet.
- Atención al ciudadano en kioscos de bajo consumo: conversaciones multi-turno en hardware Cortex-A72 con latencia declarada de ~38 ms, adecuada para interacción en tiempo real.
- Procesamiento de documentos en el borde: resumen y extracción de información de textos locales en dispositivos con menos de 120 MB de RAM operativa, manteniendo los datos en el dispositivo.
- Investigación lingüística de bajos recursos: uso como base para experimentos con lenguas africanas subrepresentadas, dado su empaquetado ligero y licencia MIT.
- Despliegue en entornos con requisitos de soberanía de datos: organizaciones que no pueden enviar información a servicios en la nube pueden ejecutar el modelo íntegramente en su infraestructura local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1,8 GB de peso en disco para la cuantización `q4_k_m`; el autor declara menos de 120 MB de RAM operativa activa, aunque en la práctica el proceso completo de llama.cpp requiere cargar el modelo en memoria (del orden de 2 GB o más según el backend y el contexto).
- GPU recomendadas: no documentadas; el modelo está optimizado para CPU ARM (Cortex-A72) y hardware de baja potencia, no para GPU dedicadas.
- GPU de consumo: no se documenta compatibilidad con RTX 4090, A100 o H100; el enfoque del autor es CPU y dispositivos de borde.
- Opciones de despliegue: llama.cpp y llama-cpp-python (el quickstart de la model card usa `pip install llama-cpp-python huggingface_hub`); no se documentan vLLM, TGI ni Ollama.
- Latencia: aproximadamente 38 ms por inferencia local en hardware ARM de consumo, según el autor. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| nioncorp/nil-3b-gguf | 3B | no disponible | GGUF `q4_k_m` (1,8 GB) | MIT | Offline, lenguas africanas, borde ARM |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128k tokens | safetensors, GGUF comunitario | Llama 3.2 Community License | Modelo base generalista |
| Qwen2.5-3B-Instruct | 3B | 32k tokens (128k en variantes ampliadas) | safetensors, GGUF | Apache 2.0 | Generalista multilingüe |
| Gemma 2 2B Instruct | 2B | 8k tokens | safetensors, GGUF | Gemma Terms of Use | Generalista ligero |

Los datos de Llama 3.2 3B Instruct, Qwen2.5-3B-Instruct y Gemma 2 2B corresponden a sus model cards públicas; los de `nil-3b` proceden de la información del repositorio. No se dispone de comparación de rendimiento medida entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia medida de calidad en MMLU, HumanEval, GSM8K ni tareas multilingües, lo que impide validar las afirmaciones de la model card.
- Discrepancia entre el ajuste declarado (32 lenguas africanas) y los metadatos del repositorio (6 idiomas): conviene verificar la cobertura real antes de producción.
- El modelo base es Llama 3.2 3B, con sesgos conocidos de su corpus de entrenamiento; el ajuste fino no documenta mitigaciones.
- Riesgo de alucinación inherente a un modelo de 3B, especialmente en dominios de salud y política, donde el autor declara especialización: requiere verificación humana en aplicaciones críticas.
- La licencia del repositorio es MIT, pero el modelo deriva de Llama 3.2, sujeto a la Llama 3.2 Community License; conviene revisar la compatibilidad de ambas licencias para uso comercial.
- Solo se distribuye en GGUF `q4_k_m`: no hay pesos en safetensors ni otras cuantizaciones documentadas, lo que limita el ajuste fino posterior.
- La latencia de ~38 ms y el consumo de <120 MB de RAM son cifras declaradas por el autor sin metodología de medición publicada.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/nioncorp/nil-3b-gguf
- Nion Intelligence Labs: https://labs.nioncorp.com/
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
