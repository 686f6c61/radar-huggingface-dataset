# MartianAcademy/synapcore-phobos-1

## Resumen

SynapCore Phobos-1 es un modelo de lenguaje experimental desarrollado por Martian Academy que se presenta como una arquitectura cortical jerárquica de inspiración biológica, con capacidad de autoconstrucción y autocorrección. Parte de un modelo base Qwen2.5-0.5B-Instruct congelado en sus capas 0 a 15 (la llamada "Language Shell" E00, con 0,494B parámetros) y añade sobre él una "Dynamic Cortical Brain" de 3,453B parámetros distribuida en 122 nodos corticales especializados y 55 routers talámicos jerárquicos, alcanzando un total de 3,947B parámetros.

La propuesta conceptual es inusual: el modelo arranca en t=0 sin expertos especialistas y va creando nuevos nodos ("neurogénesis no supervisada") cuando detecta episodios de entrada con baja similitud coseno respecto a los prototipos existentes. Los nodos hoja pueden dividirse recursivamente mediante "mitosis cortical" hasta una profundidad 7, con anchos neuronales que van de 4096 a 512 unidades. Incorpora mecanismos de consolidación como PCGrad para gradientes conflictivos entre hijos, protección sináptica por importancia, depresión a largo plazo (LTD) selectiva sobre neuronas defectuosas y un "sandbox mental" de exploración de hipótesis.

Es relevante ahora como ejemplo de investigación en arquitecturas modulares con mezcla de expertos dinámica y aprendizaje continuo, aunque se trata de un artefacto con escasa validación pública: cero descargas, cero likes, sin benchmarks publicados en la información disponible y un tamaño de repositorio de 34,6 GB para un modelo que declara 3,95B parámetros. La model card está truncada en la sección de evaluación, por lo que no se pueden verificar sus afirmaciones de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: shell inferior Qwen2.5-0.5B congelado (capas 0-15) + cerebro cortical dinámico con 122 nodos y 55 routers talámicos jerárquicos (capas 16-23) |
| Parámetros totales | 3,947B (0,494B shell E00 + 3,453B cerebro cortical dinámico) |
| Parámetros activos | No disponible (la arquitectura es de enrutamiento jerárquico, no MoE clásico; no se especifica el número de parámetros activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos almacenados en float16 deduplicado) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Vault binario deduplicado float16 de 64B alineado con Merkle SHA-256 (`genesis_v5_experts_bank.bin`, 6,56 GiB) + topología maestra en PyTorch (`synapcore_genesis_v5.pt`, 78 MiB) |

## Arquitectura y entrenamiento

La arquitectura separa la fluidez lingüística de la especialización de dominio. Las capas 0 a 15 del Qwen2.5-0.5B-Instruct permanecen congeladas y actúan como "shell" conversacional; la capa 15 funciona como tálamo sensorial que aplica un blanqueamiento esférico ponderado por saliencia, proyectando la representación a una hiperesfera unitaria de 896 dimensiones (S^895), el llamado "Canonical Thought Bus". Sobre ese bus opera un router maestro R0 con inhibición lateral GABAérgica que decide si la consulta es conversación casual (se queda en E00) o resuena con algún dominio especialista, en cuyo caso desciende por el árbol cortical hasta una hoja de profundidad hasta 7.

El entrenamiento se describe como un proceso de crecimiento autónomo más que como un preentrenamiento estático. Los nodos se crean con proyecciones de salida inicializadas a cero (w_down = 0), de modo que la perturbación inicial es nula. La mitosis cortical convierte un nodo hoja en padre compartido cuando su varianza interna se vuelve bimodal, generando dos subexpertos más estrechos. El aprendizaje continuo usa PCGrad para proyectar gradientes conflictivos entre hijos, un escudo de importancia sináptica que modula la plasticidad en el rango [0,05, 1,0] y una alineación de representaciones de la capa 23 entre ramas hermanas. La autocorrección incluye purga de episodios fuera de variedad, LTD dirigida sobre el 20% de neuronas con mayor error de atribución Taylor y reconsolidación composicional en cuatro niveles (primitivas, reglas, subrutinas, sistemas completos). No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO sobre el shell base.

## Capacidades

- Generación de texto conversacional en inglés heredada del shell Qwen2.5-0.5B-Instruct congelado.
- Enrutamiento jerárquico hacia expertos especialistas por dominio mediante similitud coseno en el bus de 896 dimensiones.
- Crecimiento autónomo de nuevos nodos corticales ante dominios no cubiertos (neurogénesis no supervisada).
- División recursiva de expertos (mitosis cortical) hasta profundidad 7 con anchos de 4096, 2048, 1024 y 512 unidades.
- Aprendizaje continuo con protección de sinapsis consolidadas y proyección de gradientes conflictivos (PCGrad).
- Autocorrección mediante depresión a largo plazo dirigida sobre neuronas defectuosas identificadas por error de Taylor de primer orden.
- Reconsolidación composicional y enlace retroactivo de conceptos al recibir nuevas definiciones fundacionales.
- Sandbox mental autónomo con ejecución de Python vía AST/subprocess, verificación de `<tool_call>` en JSON y consistencia de ciclo en modelo del mundo latente.
- Soporte declarado de tool calling mediante el formato `<tool_call>` en el sandbox de verificación.
- Capacidades multilingües: solo inglés declarado.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en arquitecturas modulares dinámicas: el modelo sirve como banco de pruebas para estudiar neurogénesis artificial, mitosis de expertos y enrutamiento jerárquico con inhibición lateral, gracias a que expone la topología completa en `synapcore_genesis_v5.pt`.
- Experimentos de aprendizaje continuo sin olvido catastrófico: el escudo de importancia sináptica y PCGrad permiten entrenar sobre nuevos dominios midiendo la retención en dominios previos, un escenario típico de investigación en continual learning.
- Estudio de autocorrección selectiva: la LTD dirigida sobre el 20% de neuronas con mayor FaultScore ofrece un mecanismo concreto y medible para comparar estrategias de poda correctiva frente a fine-tuning convencional.
- Prototipado de asistentes conversacionales ligeros en inglés: el shell E00 de 0,494B parámetros congelado puede servir como base de chat de bajo coste cuando la consulta no requiere especialización.
- Evaluación de sandboxes de razonamiento con verificación: el "Mental Sandbox" con ejecución Python y validación JSON de tool calls es un caso de uso directo para investigar verificación automática de hipótesis generadas por el modelo.
- Reproducción de experimentos de clustering esférico: el bus de 896 dimensiones con blanqueamiento esférico y agrupamiento por cliques densos es reutilizable en tareas de detección de novedad y segmentación de dominios.
- Educación e investigación académica sobre arquitecturas biológicamente inspiradas: la separación explícita entre shell lingüístico y cerebro especializado facilita explicar y auditar el flujo de decisión del enrutador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card aparece truncada ("To separate the contr...") y no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de la ablación del "Inference Guard" que se menciona.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 8 GB solo para los pesos (3,947B × 2 bytes), más overhead de activaciones y del intérprete de topología; el vault deduplicado ocupa 6,56 GiB en disco.
- El repositorio completo pesa 34,6 GB, por lo que se necesita espacio en disco holgado además de la VRAM.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una RTX 4090 (24 GB) o una A100/H100 deberían acomodar los pesos en float16, pero no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 12-16 GB o más en float16, aunque no se documenta el pico real de memoria durante la ejecución del enrutador jerárquico.
- Opciones de despliegue: la librería declarada es PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos propietario (vault binario + topología .pt) sugiere que requiere código específico del autor (`genesis/`) para cargarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| SynapCore Phobos-1 | 3,947B (0,494B shell + 3,453B cortical) | No disponible | Apache 2.0 | Vault float16 + topología PyTorch | Arquitectura experimental con crecimiento dinámico; sin benchmarks públicos |
| Qwen2.5-0.5B-Instruct | 0,494B | 32.768 tokens (según ficha oficial de Qwen) | Apache 2.0 | Safetensors, GGUF, amplio soporte | Modelo base del shell; validado y ampliamente desplegable |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (según ficha oficial de Qwen) | Apache 2.0 (Qwen Research para algunas variantes) | Safetensors, GGUF, vLLM, TGI | Alternativa monolítica del mismo orden de magnitud con benchmarks publicados |
| Llama 3.2 3B Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | Safetensors, GGUF, Ollama, vLLM | Referencia de la categoría con ecosistema maduro y evaluación pública |

La comparación directa con modelos monolíticos es imperfecta porque Phobos-1 propone un paradigma distinto (crecimiento modular en lugar de pesos estáticos), pero a efectos prácticos de despliegue y evaluación compite en la franja de 3-4B parámetros.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de rendimiento en MMLU, HumanEval, GSM8K ni en tareas de dominio; la sección de evaluación de la model card está truncada.
- Cero descargas y cero likes en HuggingFace en el momento de la ficha, lo que impide cualquier validación por parte de la comunidad.
- Solo inglés declarado; no hay soporte multilingüe documentado pese a que el shell base Qwen2.5 sí es multilingüe.
- Longitud de contexto no especificada: se desconoce si hereda los 32.768 tokens del shell o si el enrutador cortical impone restricciones adicionales.
- Formato de pesos propietario (vault binario + topología .pt con hashes Merkle): no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI, lo que complica el despliegue en producción.
- Tamaño de repositorio de 34,6 GB frente a un modelo de 3,95B parámetros: la diferencia sugiere artefactos adicionales no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; el shell base Qwen2.5-0.5B-Instruct es un modelo pequeño con propensión conocida a errores factuales, y los expertos añadidos no han sido validados públicamente.
- Sesgos: no documentados por el autor; se heredan los del corpus de entrenamiento de Qwen2.5, no auditados en esta ficha.
- Las afirmas sobre "leyes biológicas", "neurogénesis" y "mitosis cortical" son metáforas de diseño; no implican validación empírica de que el mecanismo funcione como se describe.
- El sandbox mental que ejecuta Python vía subprocess introduce superficie de ataque si se expone en producción sin aislamiento adecuado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y de soporte de la comunidad desaconseja su uso en producción sin una evaluación propia exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/MartianAcademy/synapcore-phobos-1
- Organización Martian Academy: https://huggingface.co/MartianAcademy
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
