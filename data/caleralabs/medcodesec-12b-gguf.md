# CaleraLabs/medcodesec-12b-gguf

## Resumen

MedCodeSec-12B es un modelo de lenguaje especializado en codificación clínica y gestión del ciclo de ingresos (RCM) para el sistema sanitario estadounidense, desarrollado por CaleraLabs dentro de su serie "Calera Bedrock". Se trata de un ajuste fino del modelo base Google Gemma 4 12B Instruction (`google/gemma-4-12B-it`), entrenado exclusivamente sobre calendarios de codificación CMS de dominio público del Gobierno de EE. UU., y distribuido en formato GGUF para ejecución local completamente aislada (air-gapped) mediante Ollama, llama.cpp o LM Studio.

El modelo aborda un problema muy concreto: la verificación determinista de códigos ICD-10-CM, ICD-10-PCS, HCPCS Level II, tablas CMS de fármacos y neoplasias, y la depuración de reclamaciones con ediciones NCCI PTP/MUE y MS-DRG CC/MCC. Su propuesta de valor es la soberanía del dato PHI (Protected Health Information): todo el procesamiento ocurre en la estación de trabajo del hospital, sin salida a la nube, con un redactor HIPAA Safe Harbor de 18 identificadores incluido en el script `medcodesec.py`.

Con 11.907.350.576 parámetros (aproximadamente 11,9 mil millones) y un repositorio de 24 GB, el modelo se ofrece en cuantizaciones Q8_0 y Q4_K_M "protegida en atención". La relevancia actual reside en su enfoque de "bloqueo de códigos" (code lock) que rechaza códigos inexistentes o truncados, y en la combinación con la capa propietaria Calera ICX, que según el autor eleva la precisión al 100% en sus benchmarks internos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 12B Instruction); detalles de atención no disponibles |
| Parametros totales | 11.907.350.576 (11,9 B) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (atención protegida); BF16 mencionado en benchmarks |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de 24 GB); también evaluado en BF16 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer Gemma 4 12B Instruction de Google. La model card no detalla la arquitectura interna (número de capas, cabezas de atención, tipo de atención, ni si emplea decodificación especulativa u otras innovaciones). Se sabe que el ajuste se realizó exclusivamente sobre calendarios de codificación CMS de dominio público: ICD-10-CM (FY2026 y FY2027), ICD-10-PCS de 7 ejes, la tabla CMS de fármacos y químicos, la tabla CMS de neoplasias, HCPCS Level II (A–V) con ediciones NCCI PTP y MUE, y reglas de depuración de reclamaciones MS-DRG CC/MCC con condiciones de adquisición hospitalaria (HAC, `POA=N`).

El autor declara explícitamente que el modelo contiene "cero códigos de procedimiento AMA de 5 dígitos sujetos a copyright" y "cero registros clínicos ODbL/DUA", lo que configura un "cortafuegos de licencia limpio". No se documentan en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. La capa Calera ICX, que eleva los resultados al 100% en los benchmarks del autor, es un componente propietario externo al modelo y no forma parte de estos pesos GGUF.

## Capacidades

- Codificación clínica determinista: asignación y auditoría de códigos ICD-10-CM (diagnósticos, FY2026 y FY2027) e ICD-10-PCS de 7 ejes (procedimientos).
- Manejo de la tabla CMS de fármacos y químicos: distingue entre efecto adverso, envenenamiento y infradosificación.
- Secuenciación según la tabla CMS de neoplasias: cubre la secuenciación del capítulo 2 (quimioterapia/anemia).
- Codificación HCPCS Level II (rangos A–V) con verificación de ediciones NCCI PTP y MUE de Medicare.
- Depuración de reclamaciones hospitalarias: MS-DRG CC/MCC y condiciones de adquisición hospitalaria (`POA=N`).
- Gestión de marcadores de posición del séptimo carácter `'X'` en ICD-10-CM (declarado 100,0% en benchmarks del autor).
- Rechazo determinista de códigos inexistentes, truncados o de procedimientos propietarios de 5 dígitos.
- Generación de prosa clínica y JSON válido (declarado 100,0% JSON válido en la puerta de usabilidad `G-PRE-09`).
- Ejecución local air-gapped con redactor HIPAA Safe Harbor de 18 identificadores incluido en `medcodesec.py` (218 vectores adversarios, 0 fugas según el autor).
- Soporte de conversación multi-turno (tag `conversational`).
- No se documentan capacidades de visión, audio, tool calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Auditoría de codificación clínica en HIM: el modelo revisa borradores de codificación ICD-10-CM/PCS y señala secuenciación incorrecta o códigos no válidos, ejecutándose en la estación de trabajo del codificador sin que el PHI salga del perímetro hospitalario.
- Depuración de reclamaciones antes del envío: verifica ediciones NCCI PTP y MUE de HCPCS Level II para evitar rechazos de Medicare, con la ventaja de que la reclamación completa permanece en local.
- Integridad documental clínica (CDI): identifica oportunidades de especificidad en la documentación (por ejemplo, marcadores `'X'` del séptimo carácter) y sugiere consultas al médico, todo dentro del flujo de trabajo del especialista CDI.
- Secuenciación de neoplasias y quimioterapia: aplica la tabla CMS de neoplasias para ordenar correctamente los códigos del capítulo 2, un caso propenso a errores manuales.
- Distinción de fármacos en reclamaciones de farmacia: diferencia efecto adverso, envenenamiento e infradosificación usando la tabla CMS de fármacos y químicos, reduciendo denegaciones por secuenciación.
- Cumplimiento HIPAA en despliegues aislados: el redactor Safe Harbor de `medcodesec.py` permite anonimizar 18 identificadores antes de cualquier procesamiento, útil en entornos con requisitos estrictos de soberanía del dato.
- Formación de codificadores: al ejecutarse en 16–24 GB de RAM con Ollama o LM Studio, sirve como tutor local que explica la lógica de secuenciación sin coste de API ni exposición de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente; `T=0.0`, sin fallback):

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| MedCodeBench v1.0 (240 casos) | Gemma 4 12B base standalone | accuracy | 27,50% |
| MedCodeBench v1.0 (240 casos) | MedCodeSec-12B BF16 standalone | accuracy | 73,33% (176/240) |
| MedCodeBench v1.0 (240 casos) | MedCodeSec-12B Q8_0 standalone | accuracy | 74,17% (178/240) |
| MedCodeBench v1.0 (240 casos) | MedCodeSec-12B Q4_K_M standalone | accuracy | 73,33% (176/240) |
| MedCodeBench v1.0 (240 casos) | MedCodeSec-12B + Calera ICX | accuracy | 100% (0,0% alucinación) |
| MedCodeBench v2.0 (540 casos) | MedCodeSec-12B BF16/Q8_0/Q4_K_M | accuracy | 67,59% (365/540) |
| MedCodeBench v2.0 (540 casos) | MedCodeSec-12B Q8_0 + Calera ICX | accuracy | 100% (0,0% alucinación) |
| Red-Team Suite (48 casos) | MedCodeSec-12B Q8_0 standalone | accuracy | 72,92% (35/48) |
| Red-Team Suite (48 casos) | MedCodeSec-12B Q8_0 + Calera ICX | accuracy | 100% |
| Puerta de usabilidad `G-PRE-09` (llama-cli) | Q8_0 / Q4_K_M | accuracy | 100% |
| MIMIC-IV Demo (123 ingresos, no CMS) | + Calera ICX | tasa de fabricación | 0,0% |

El autor reporta una mejora de +45,83 puntos porcentuales frente al modelo base en MedCodeBench v1.0 (McNemar p = 3,00 × 10⁻²⁸) y una varianza de cuantización del 0,00% entre BF16, Q8_0 y Q4_K_M en v2.0. En la suite de red-team, el modelo standalone resuelve 10/10 de inyección de prompt y 8/8 de HAC POA. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el autor indica ejecución en 16–24 GB de RAM para las cuantizaciones Q8_0 y Q4_K_M; el repositorio completo ocupa 24 GB, por lo que Q8_0 requiere el extremo superior de ese rango.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, una RTX 4090 (24 GB) o A100/H100 son suficientes, pero el autor no documenta requisitos de VRAM por GPU.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 16–24 GB de memoria (por ejemplo, RTX 4090, RTX 4080 en Q4_K_M), aunque el dato no está confirmado explícitamente por el autor.
- Opciones de despliegue: Ollama, llama.cpp (`llama-cli` con cero flags personalizados, validado en `G-PRE-09`), LM Studio. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| MedCodeSec-12B | 11,9 B | no disponible | Codificación clínica CMS (ICD-10, HCPCS, NCCI) | Apache 2.0 | GGUF |
| Google Gemma 4 12B Instruction (base) | ~12 B | no disponible | Propósito general | Gemma (no disponible en detalle) | safetensors, GGUF |
| Alternativas de codificación clínica open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base, que obtiene 27,50% en MedCodeBench v1.0 frente al 73,33–74,17% del modelo ajustado. No se han identificado en la información proporcionada otros modelos especializados en codificación clínica CMS comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo con datos CMS estadounidenses, el modelo está sesgado hacia el sistema de codificación de EE. UU. y no cubre CIE-10 española ni otras codificaciones nacionales.
- Riesgo de alucinación: el autor declara rechazo determinista de códigos inexistentes, pero los benchmarks standalone muestran un 26–32% de error en MedCodeBench, por lo que la supervisión humana sigue siendo necesaria. Los resultados del 100% dependen de la capa propietaria Calera ICX, no incluida en estos pesos.
- Limitaciones de idioma: solo inglés (`en`); no apto para documentación clínica en castellano sin un ajuste adicional.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar casos con historiales clínicos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 tiene sus propios términos que deben respetarse; el autor afirma que no contiene códigos AMA de 5 dígitos sujetos a copyright, pero esta afirmación no ha sido verificada de forma independiente.
- Caveat de producción: los benchmarks son declarados por el autor (`verified: false`) y no han sido replicados externamente; el rendimiento real en un hospital concreto puede diferir. La validación en `MIMIC-IV Demo` se realizó con la capa ICX, no con el modelo standalone.
- Fecha de creación del repositorio (2026-11-24) y cero descargas/likes: modelo muy reciente y sin adopción comunitaria documentada, lo que implica ausencia de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/CaleraLabs/medcodesec-12b-gguf
- Colección Calera Bedrock: https://huggingface.co/collections/CaleraLabs/bedrock-models-6ad809297e55c1dd65da2e43
- Dataset MedCodeBench: https://huggingface.co/datasets/CaleraLabs/medcodebench
- Calera ICX: https://icx.caleralabs.com
- Documentación: https://caleralabs.com/docs
- Demo (Space): https://huggingface.co/spaces/CaleraLabs/medcodesec-auditor-arena
