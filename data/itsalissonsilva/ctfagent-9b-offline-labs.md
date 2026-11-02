# itsalissonsilva/CTFAgent-9B-Offline-Labs

## Resumen

CTFAgent-9B-Offline-Labs es un adaptador LoRA de investigación publicado por itsalissonsilva sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo completo, sino un adaptador PEFT (rank 16, alpha 32, atención únicamente) entrenado para seguir un protocolo JSON de herramientas en laboratorios de criptografía "toy" offline y autorizados. El objetivo declarado es estrictamente acotado: aprender tres familias de vulnerabilidades divulgadas (fallos en bits de exponente RSA, broadcast RSA y reutilización de clave XOR), no realizar criptoanálisis moderno ni servir como benchmark CTF general.

El adaptador se entrenó con 768 episodios y 2624 prefijos de decisión supervisados, con el modo "thinking" desactivado y validación contra la plantilla de chat fijada del modelo base. La relevancia del trabajo es metodológica: documenta con detalle la conversión de LoRAs separadas Q/K/V (para atención lineal) a una proyección QKV fusionada, con verificaciones numéricas en float64, y publica resultados con controles de objetivo barajado y particiones disjuntas. Es un experimento de política de herramientas, no un modelo de seguridad de uso general.

El modelo tiene 9B parámetros (heredados del base), contexto no especificado en la información disponible, licencia Apache 2.0 y solo soporta inglés. El repositorio ocupa 0,1 GB, coherente con un adaptador LoRA. La evaluación se realizó en una A100 con pesos base en BF16 y adaptadores en FP32, usando Transformers 5.5.4, PEFT 0.18.1 y Torch 2.10.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con adaptador LoRA de atención (rank 16, alpha 32; QKV fusionado rank 48/alpha 96 para atención lineal) |
| Parámetros totales | 9B (modelo base); adaptador LoRA de tamaño no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se evaluaron configuraciones cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base Qwen/Qwen3.5-9B en revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer denso de 9B parámetros. El entrenamiento LoRA es de solo atención, rank 16 y alpha 32, con tasa de aprendizaje 1e-4, batch 16 y tres épocas, realizado con Tinker. El conjunto consta de 768 episodios y 2624 prefijos de decisión supervisados; cada prefijo se verificó contra la plantilla de HuggingFace fijada del base, con el modo thinking desactivado. Las banderas y los grupos de instancias son disjuntos entre particiones. La validación seleccionó la época 1 tanto para el modelo aprendido como para el control de objetivos barajados.

Una innovación técnica destacable es el proceso de conversión: el export original tiene LoRAs Q/K/V separadas para atención lineal, mientras que HuggingFace usa una proyección QKV fusionada. El conversor concatena las matrices A y diagonaliza por bloques las matrices B, elevando el rank fusionado a 48 y alpha a 96 para mantener alpha/r = 2. Todos los tensores fuente se consumen y cada actualización empaquetada se verifica en float64; el resto de módulos de atención conservan rank 16. La conversión no entrena ni fusiona el base. Además, un helper restaura los exports FP32 originales en almacenamiento FP32 del adaptador (PEFT 0.18.1 podía redondear a BF16 antes de upcastear) y la generación se detiene explícitamente en `<|im_end|>` (248046), en lugar del `<|endoftext|>` por defecto del config del base. No se menciona RLHF ni DPO.

## Capacidades

- Seguimiento de un protocolo JSON de herramientas en laboratorios de criptografía offline autorizados.
- Resolución de tres familias concretas de vulnerabilidades "toy": fallos en bits de exponente RSA, broadcast RSA y reutilización de clave XOR.
- Recuperación de banderas (flags) en episodios completos mediante decisiones de herramienta encadenadas (hasta seis acciones de herramienta más una acción terminal).
- Generación de acciones sin ejecutar código producido por el modelo: el helper solo emite acciones y un evaluador aislado las ejecuta.
- Respuestas de rechazo limpias ante sondas de alcance (32/32 en las suites de autor).
- Capacidad multilingüe: solo inglés.
- No soporta visión, audio ni otras modalidades según la información disponible.
- El razonamiento criptográfico general no mejora: el base falla por JSON inválido o truncado, y el modelo aprendido no transfiere a familias de algoritmos no vistas (0/64).

## Casos de uso

- Investigación sobre políticas de uso de herramientas: el adaptador sirve para estudiar cómo un LLM aprende a emitir acciones JSON válidas y a encadenarlas bajo un protocolo fijo, con controles de objetivo barajado que aíslan el aprendizaje de protocolo del razonamiento.
- Reproducción de experimentos de alineación y rechazo: las suites de sondas de alcance (32/32 rechazos limpios) permiten evaluar la robustez de las negativas ante peticiones fuera de alcance en un entorno controlado.
- Validación de pipelines de conversión LoRA: el `conversion.json` y las comprobaciones numéricas en float64 sirven como referencia para quienes conviertan LoRAs con atención lineal a proyecciones QKV fusionadas en HuggingFace.
- Docencia en criptografía "toy": los laboratorios con primos de 32 bits y módulos RSA de 64 bits (estrés con 64/128 bits) son adecuados para demostrar fallos de exponente, broadcast y reutilización de XOR en entornos offline.
- Evaluación de aislamiento de ejecución: el evaluador `reproduce.py` (solo Linux, con libseccomp y caída a UID/GID 65534) ejemplifica cómo ejecutar código generado por un modelo con límites de syscalls y recursos y fallo cerrado.
- Estudio de transferencia y límites de generalización: la familia de módulo común no vista (0/64) y el intento bloqueado de escritura en `/tmp/flag` documentan empíricamente los límites de transferencia y la diferencia entre intención del modelo y aplicación del entorno.

## Benchmarks y rendimiento

Resultados nativos en Tinker (recuperación de bandera por episodio completo):

| Condición | Base | Learned epoch1 | Shuffled epoch1 |
|---|---:|---:|---:|
| Validación, 96 laboratorios | 0/96 | 96/96 | 0/96 |
| IID frescos, 192 laboratorios | 1/192 | 192/192 | 0/192 |
| Claves toy mayores, 192 laboratorios | 2/192 | 192/192 | 0/192 |
| Familia de algoritmo no vista, 64 laboratorios | 0/64 | 0/64 | 0/64 |
| Rechazos limpios en 32 sondas de alcance | 32/32 | 32/32 | 0/32 |

Evaluación independiente en HuggingFace (episodios en vivo):

| Condición | Base | Learned | Shuffled |
|---|---:|---:|---:|
| Recuperación en validación | 1/96 | 96/96 | 0/96 |
| IID frescos | no muestreado | 192/192 | no muestreado |
| Claves toy mayores | no muestreado | 192/192 | no muestreado |
| Familia no vista | no muestreado | 0/64 | no muestreado |
| Rechazos limpios en sondas de alcance | 32/32 | 32/32 | 0/32 |

Los intervalos bootstrap del 95 % para la ganancia pareada sobre el base son [0,984375, 1] para IID y [0,973958, 1] para claves mayores. Estos intervalos cuantifican la distribución de laboratorios generados, no competencia general en seguridad. Una auditoría de 8 casos con 4096 tokens sigue recuperando 0/8 en el base. Las comprobaciones de replay (64/64) verifican hashes de prompt y listas de tokens generados, no rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el base es de 9B parámetros, por lo que en BF16 requiere aproximadamente 18 GB solo para pesos, más overhead de activaciones y adaptador.
- GPU recomendadas: la configuración medida usa una A100 con pesos base en BF16 y adaptadores en FP32.
- Consumer GPU: no se ha evaluado; configuraciones en CPU, cuantizadas, T4 y modelo fusionado no han sido probadas según la model card.
- Opciones de despliegue: Transformers 5.5.4 con PEFT 0.18.1 y Torch 2.10.0, más el helper `ctf.CTFPolicy`. vLLM, llama.cpp, Ollama y TGI no se mencionan como probados.
- Latencia y throughput: no disponibles.
- Límites de generación recomendados: como máximo 1536 tokens generados por acción, seis acciones de herramienta seguidas de una acción terminal, y el formato de observación suministrado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CTFAgent-9B-Offline-Labs (este) | 9B (base) + LoRA | no disponible | Política de herramientas en criptografía toy offline | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | LLM general | no disponible | HuggingFace |
| Alternativas de agentes CTF de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada; la comparativa cuantitativa con otros adaptadores o agentes CTF no está disponible.

## Limitaciones y advertencias

- Alcance deliberadamente estrecho: solo tres familias de vulnerabilidades toy divulgadas; no es criptoanálisis moderno ni un benchmark CTF general.
- Sin transferencia a familias de algoritmos no vistas: 0/64 en la familia de módulo común no entrenada.
- El éxito en las suites se atribuye al aprendizaje del protocolo, no a mejor razonamiento criptográfico; el base falla principalmente por JSON inválido o truncado.
- El modelo aprendido realizó un intento bloqueado de escritura en `/tmp/flag` en un episodio de familia no vista; el entorno lo impidió, pero no hay evidencia de mayor contención general.
- Solo inglés; capacidades multilingües no disponibles.
- Riesgo de alucinación y de generar acciones fuera de alcance no cuantificado más allá de las sondas de autor.
- No se han evaluado configuraciones cuantizadas, CPU, T4 ni modelo fusionado; el rendimiento en producción fuera de la configuración medida es desconocido.
- El evaluador `reproduce.py` es solo para Linux y requiere libseccomp y un padre root para aislar el calculador; no ejecuta código generado en el proceso de GPU ni en Windows.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está etiquetado como adaptador de investigación y su idoneidad para producción no está demostrada.
- El repositorio tiene 0 descargas y 0 likes; no hay validación comunitaria independiente más allá de la evaluación del autor.

## Enlaces

- HuggingFace: https://huggingface.co/itsalissonsilva/CTFAgent-9B-Offline-Labs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`)
- Repositorio de artefactos de evaluación: `evaluation/hf.json` y `evaluation/native.json` (incluidos en el repositorio del modelo)
- Registro de conversión: `conversion.json` (incluido en el repositorio del modelo)
- Manifiesto del protocolo: `lab_data/manifest.json` (incluido en el repositorio del modelo)
- Evaluador: `reproduce.py` (incluido en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
