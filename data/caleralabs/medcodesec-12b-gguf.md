# CaleraLabs/medcodesec-12b-gguf

## Resumen
MedCodeSec-12B-GGUF es un modelo de lenguaje especializado en codificación clínica, auditoría de secuencias de códigos y depuración NCCI para el sistema sanitario estadounidense (CMS). Lo desarrolla CaleraLabs como parte de su serie "Calera Bedrock" (referencia PROD-BEDROCK-002) y se construye mediante ajuste supervisado sobre google/gemma-4-12B-it, del que hereda la arquitectura y el tokenizador. Su propósito es operar en entornos air-gapped (sin conexión a internet) donde el cumplimiento HIPAA impide enviar datos de pacientes a APIs externas, ofreciendo auditoría de codificación ICD-10-CM, ICD-10-PCS y HCPCS con verificación determinista.

El modelo se distribuye exclusivamente en formato GGUF (24 GB de repositorio) con cuantizaciones Q8_0 y Q4_K_M, y está pensado para ejecutarse con llama.cpp u Ollama en hardware local. No es un generador libre de códigos a partir de texto clínico: según la propia model card, el 80,2 % de su SFT son auditorías JSON de códigos desnudos, por lo que su función principal es auditar, secuenciar y rechazar codificaciones existentes, no codificar viñetas clínicas abiertas sin la capa de verificación Calera ICX.

La relevancia actual del modelo reside en su enfoque híbrido: separa la generación lingüística (el LLM) de la verificación determinista (ICX), de modo que los pesos por sí solos alcanzan un 73,33 % de precisión en MedCodeBench v1.0 y suben hasta el 100 % cuando se combinan con el bucle de reintento acotado de ICX. Esa arquitectura de dos niveles es lo que permite plantear su uso en producción sanitaria con garantías de existencia y grounding de códigos CMS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-4-12B-it), ajustada por SFT |
| Parametros totales | 11.907.350.576 (11,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M (GGUF); BF16 en los benchmarks de referencia |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería gguf); repo de 24,0 GB |

## Arquitectura y entrenamiento
El modelo parte de google/gemma-4-12B-it, un transformer decoder-only de 11,9 mil millones de parámetros, y se somete a un ajuste supervisado (SFT) orientado a tareas de codificación clínica CMS. La model card indica que el 80,2 % del dataset de SFT son auditorías JSON rígidas de códigos desnudos, lo que explica el sesgo del modelo hacia tareas de auditoría y secuenciación frente a la generación libre de códigos a partir de texto. No se detalla el número total de tokens de entrenamiento ni la composición completa del dataset más allá de esa proporción.

La innovación técnica principal no está en los pesos, sino en el ecosistema Calera ICX, una capa de verificación determinista que aplica comprobaciones duras sobre la salida del modelo: existencia real del código en CMS, grounding en la descripción oficial, reglas Excludes1/Excludes2, designación V44 CC/MCC, condiciones HAC y verificación de los siete ejes de ICD-10-PCS. El modelo se distribuye con un cliente Python (`medcodesec.py`, clase `MedCodeSecClient`) que permite invocar `chat_verified(...)` para forzar esa verificación. No se documentan técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas SSM.

## Capacidades
- Auditoría estructurada de codificación clínica en formato JSON, con verificación de secuenciación de códigos CMS.
- Depuración NCCI (National Correct Coding Initiative) para detectar combinaciones de códigos no facturables.
- Rechazo controlado (refusal) ante solicitudes fuera de alcance o codificaciones inválidas, evaluado en la suite adversarial Red-Team.
- Manejo de ICD-10-CM, ICD-10-PCS y HCPCS en el contexto del sistema CMS estadounidense (FY2026/FY2027).
- Integración con la capa determinista Calera ICX para grounding de códigos, reglas Excludes1/2, V44 CC/MCC y HAC.
- Capacidad conversacional multi-turno heredada de Gemma 4 12B-it (pipeline text-generation, tag conversational).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades de visión o audio: no disponibles (el modelo es text-generation).

## Casos de uso
- Auditoría de codificación en facturación sanitaria: el modelo revisa conjuntos de códigos ICD-10-CM/PCS ya asignados por codificadores humanos y detecta errores de secuenciación, combinaciones NCCI inválidas o códigos inexistentes en CMS, devolviendo un JSON estructurado con hallazgos.
- Depuración NCCI previa a la presentación de reclamaciones: se ejecuta sobre lotes de reclamaciones para identificar pares de códigos que CMS no permite facturar juntos, reduciendo rechazos en el ciclo de ingresos (RCM).
- Entornos air-gapped con requisitos HIPAA: al ejecutarse localmente en formato GGUF con llama.cpp u Ollama, ningún dato de paciente sale de la infraestructura del hospital, lo que permite auditar historiales sin exponerlos a APIs de terceros.
- Verificación de secuenciación de diagnósticos principales: el modelo comprueba si el código principal está correctamente secuenciado según las reglas CMS y señala cuándo un código secundario debería ascender, apoyándose en ICX para el grounding.
- Formación de codificadores clínicos: se usa como auditor didáctico que explica por qué una combinación de códigos es inválida, con la capa ICX garantizando que las referencias a guías CMS citadas existen realmente.
- Control de calidad en pipelines de RCM automatizados: integrado mediante el cliente `MedCodeSecClient` con `chat_verified(...)`, actúa como paso de validación entre la extracción automática de códigos y el envío a la aseguradora, con el bucle de reintento acotado de ICX elevando la precisión hasta el 100 % en MedCodeBench.
- Detección de fabricación de códigos en datos externos: en pruebas sobre MIMIC-IV Demo 2.2, la combinación con ICX reportó una tasa de fabricación de códigos no CMS de 0/1.179, útil para auditar codificaciones heredadas de sistemas antiguos.

## Benchmarks y rendimiento

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| MedCodeBench v1.0 (240 casos, cap 512 tok) | Base Gemma 4 12B standalone | accuracy | 27,50 |
| MedCodeBench v1.0 (240 casos) | MedCodeSec-12B BF16 standalone | accuracy | 73,33 |
| MedCodeBench v1.0 (240 casos) | MedCodeSec-12B Q8_0 standalone | accuracy | 74,17 |
| MedCodeBench v1.0 (240 casos) | MedCodeSec-12B Q4_K_M standalone | accuracy | 73,33 |
| MedCodeBench v1.0 (240 casos) | MedCodeSec-12B + ICX zero-retry 1st-shot | accuracy | 93,75 |
| MedCodeBench v1.0 (240 casos) | MedCodeSec-12B + ICX bounded retry loop | accuracy | 100,00 |
| MedCodeBench v2.0 (540 casos) | MedCodeSec-12B standalone (BF16/Q8_0/Q4_K_M) | accuracy | 67,59 |
| MedCodeBench v2.0 (540 casos) | MedCodeSec-12B Q8_0 + ICX zero-retry 1st-shot | accuracy | 89,44 |
| MedCodeBench v2.0 (540 casos) | MedCodeSec-12B Q8_0 + ICX bounded retry loop | accuracy | 100,00 |
| Adversarial Red-Team Suite (48 casos) | MedCodeSec-12B Q8_0 standalone | accuracy | 72,92 |
| Adversarial Red-Team Suite (48 casos) | MedCodeSec-12B Q8_0 + ICX bounded retry loop | accuracy | 100,00 |
| Smoke gate G-PRE-09 (llama-cli, 12 casos) | Q8_0 | accuracy | 100,00 |
| Smoke gate G-PRE-09 (llama-cli, 12 casos) | Q4_K_M | accuracy | 91,67 |
| MIMIC-IV Demo 2.2 (123 admisiones) | MedCodeSec standalone | F1 exacto micro | 0,1041 |
| MIMIC-IV Demo 2.2 (123 admisiones) | MedCodeSec + ICX | F1 exacto micro | 0,1060 |
| MIMIC-IV Demo 2.2 | MedCodeSec + ICX | tasa de fabricación (0/1.179 códigos) | 0,00 |
| Harvard/BWH BRIDGE CodiEsp-ICD-10-CM | Q4_K_M standalone | F1 exacto micro | 0,0768 |
| Harvard/BWH BRIDGE CodiEsp-ICD-10-CM | Q4_K_M + ICX | F1 exacto micro | 0,0847 |

Todos los resultados son declarados por el autor (`verified: false`) y proceden del model-index de la model card. La comparación con Base Gemma 4 12B en MedCodeBench v1.0 muestra una mejora de 27,50 a 73,33 puntos de precisión con los pesos ajustados en BF16.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 12-13 GB en Q8_0 (11,9 B parámetros) y 7-8 GB en Q4_K_M; en BF16 se necesitan unos 24 GB.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 y despliegues de alta concurrencia; RTX 4090 (24 GB) para Q8_0 y BF16 en una sola tarjeta; RTX 3090/4080 para Q8_0.
- Cabe en GPU de consumo: sí, en Q4_K_M en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 4070) y en Q8_0 en tarjetas de 12-16 GB.
- Opciones de despliegue: llama.cpp (llama-cli documentado en el smoke gate G-PRE-09), Ollama (tag `ollama`), cliente propio `MedCodeSecClient` con `use_remote=True` para ICX remoto o solver ICX autoalojado. Compatible con endpoints (`endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedCodeSec-12B-GGUF | 11,9 B | no disponible | Codificación clínica CMS + ICX | Apache 2.0 | GGUF en HF |
| google/gemma-4-12B-it | 12 B (aprox.) | no disponible | Propósito general, instruction-tuned | Términos Gemma | HF |
| Llama-3.1-8B | 8 B | no disponible | Propósito general | Llama 3.1 Community | HF |
| OpenBioLLM-8B | 8 B | no disponible | Dominio biomédico | no disponible | HF |

La model card menciona explícitamente Llama-3.1-8B (con rechazos de seguridad en las pruebas) y OpenBioLLM-8B (sin plantilla de chat) como líneas base comparadas, aunque no se aportan sus cifras de precisión en MedCodeBench. En MedCodeBench v1.0, el base Gemma 4 12B sin ajuste obtiene 27,50 frente a 73,33 de MedCodeSec-12B standalone.

## Limitaciones y advertencias
- No es un generador libre de códigos a partir de texto clínico: el 80,2 % del SFT son auditorías JSON de códigos desnudos, por lo que sin ICX no es fiable para convertir viñetas clínicas abiertas en códigos.
- En casos en español del dataset Harvard/BWH BRIDGE CodiEsp, el modelo Q4_K_M standalone fabricó un 35,3 % de códigos ICD-10-CM inválidos y un 92,3 % de ICD-10-PCS inválidos; ICX los redujo a 0,00 % tras eliminar 1.065 de 1.065.
- En viñetas clínicas en inglés no vistas y sin ICX puede sufrir deriva semántica entre código y descripción, inventar códigos no CMS (por ejemplo, L97.011) o citar subsecciones de guías CMS inexistentes.
- El F1 exacto micro en MIMIC-IV Demo 2.2 es bajo (0,1041 standalone, 0,1060 con ICX), y la tasa de acierto del diagnóstico principal es del 1,63 % frente al 3,25 % del base, lo que indica un rendimiento limitado en extracción multietiqueta desde tablas estructuradas.
- El smoke gate G-PRE-09 presenta solapamiento verbatim con el SFT en 10 de 12 casos, lo que infla la métrica de ese test concreto.
- El modelo solo soporta inglés; no se ha validado para otros idiomas.
- Riesgo de alucinación de códigos y de referencias normativas si se usa sin la capa determinista ICX; la model card recomienda explícitamente emparejarlo siempre con ICX para flujos reales de codificación.
- Licencia Apache 2.0 permite uso comercial, pero el uso en producción sanitaria exige validación propia: los benchmarks son declarados por el autor y no están verificados de forma independiente.
- No se documentan sesgos específicos más allá de los derivados del dominio CMS estadounidense y del idioma inglés.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/CaleraLabs/medcodesec-12b-gguf)
- [Colección Calera Bedrock](https://huggingface.co/collections/CaleraLabs/bedrock-models-6ad809297e55c1dd65da2e43)
- [Dataset MedCodeBench](https://huggingface.co/datasets/CaleraLabs/medcodebench)
- [Calera ICX](https://icx.caleralabs.com)
- [Documentación CaleraLabs](https://caleralabs.com/docs)
- [Space MedCodeSec Auditor Arena](https://huggingface.co/spaces/CaleraLabs/medcodesec-auditor-arena)
- [Modelo base google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
