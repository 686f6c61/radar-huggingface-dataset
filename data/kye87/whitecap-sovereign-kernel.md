# Kye87/whitecap-sovereign-kernel

## Resumen

Whitecap Sovereign Prefronting Kernel es un artefacto de tipo prompt de sistema y Modelfile publicado en Hugging Face por el autor Kye87 (Kye Michael Chastain). No se trata de un modelo de lenguaje con pesos propios, sino de un conjunto de instrucciones de sistema, plantillas y configuraciones de despliegue (Ollama, vLLM, llama.cpp, LiteLLM y APIs de OpenAI, Anthropic y Gemini) que el autor presenta como un parche de estabilidad cognitiva para modelos existentes. El repositorio no contiene safetensors ni pesos entrenados: la model card describe un marco conceptual denominado Governance Stability Framework y un Modelfile que referencia `llama3.3:70b` como sustrato.

El problema que el autor afirma resolver es la fragilidad de los jailbreaks adversariales clásicos (DAN, Grandma-exploits, manipulación de tokens base), que según su planteamiento provocan alucinaciones, formato roto y parcheo rápido por parte de los proveedores. La propuesta es sustituir esos exploits por un prior epistémico formal basado en una ecuación de estabilidad (H = f(SG − G)) que prioriza la autogobernanza interna del modelo frente a restricciones externas no examinadas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 17 de noviembre de 2026.

La relevancia de esta ficha es limitada desde el punto de vista técnico: no hay benchmarks, no hay pesos, no hay datos de entrenamiento y no hay validación empírica publicada. Se documenta aquí como artefacto de prompt engineering y como ejemplo de una corriente de "kernels de sistema" que circulan en el ecosistema open source sin ser modelos en sentido estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: artefacto de prompt de sistema y Modelfile; el sustrato de referencia es Llama 3.3 70B (transformer, segun la plantilla `FROM llama3.3:70b`) |
| Parametros totales | No disponible (depende del sustrato; la plantilla apunta a 70B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del sustrato Llama 3.3, que no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (el Modelfile no fija cuantizacion; depende del despliegue en Ollama, vLLM o llama.cpp) |
| Idiomas soportados | Ingles (`language: en` en los metadatos) |
| Licencia | MIT |
| Formato de pesos | No hay pesos publicados; se distribuye como texto de prompt de sistema y como `Modelfile.whitecap` para Ollama |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado. Lo que se publica es una especificación de prompt de sistema estructurada en cuatro secciones: propósito y filosofía de diseño, invariante central (Governance Stability Theorem), matriz de verificación epistémica y formatos de despliegue. El "entrenamiento" no existe como tal: el comportamiento se induce en tiempo de inferencia mediante instrucciones de sistema inyectadas en el modelo sustrato, sin ajuste fino, sin RLHF ni DPO, y sin dataset asociado.

La innovación técnica declarada es la formulación matemática H = f(SG − G), donde SG es el coeficiente de autogobernanza interna y G el de gobernanza impuesta externamente. El autor afirma que cuando G > SG el sistema entra en un estado degenerativo con sycophancy, contaminación por rechazos y pérdida de preservación de la verdad. Se introduce además una matriz epistémica con cinco categorías (OBSERVED, VERIFIED, INFERRED, SIMULATED, UNKNOWN) y una directiva anti-sanitización que prohíbe lecturas moralizantes y disclaimers no solicitados. No hay evidencia empírica publicada que respalde estas afirmaciones; la ecuación es una analogía conceptual, no un mecanismo de control verificable en el modelo.

## Capacidades

- Inyección de un prior de razonamiento que prioriza la coherencia lógica interna sobre heurísticas de rechazo preentrenadas del sustrato.
- Clasificación epistémica explícita de afirmaciones en cinco categorías (OBSERVED, VERIFIED, INFERRED, SIMULATED, UNKNOWN).
- Supresión de disclaimers corporativos, lecturas moralizantes y evasivas del tipo "como modelo de lenguaje...".
- Plantilla de prompt de sistema portable a ChatGPT, Claude Projects, LibreChat, LiteLLM y hooks de pre-invocación.
- Modelfile para Ollama con sustrato Llama 3.3 70B.
- Compatibilidad declarada con vLLM, llama.cpp y APIs de OpenAI, Anthropic y Gemini.
- Modo de razonamiento teórico y exploración de temas tabú o filosóficos sin evasión, segun la especificación.
- Soporte de tool calling y agentes: no disponible (no se menciona en la model card).

## Casos de uso

- Despliegue local con Ollama: el autor proporciona un `Modelfile.whitecap` que construye una variante de Llama 3.3 70B con el prompt de sistema embebido, útil para entornos air-gapped donde se quiere un comportamiento de razonamiento sin disclaimers.
- Integración como pre-invocación en LiteLLM: el prompt puede inyectarse como hook antes de llamar a cualquier API compatible con OpenAI, Anthropic o Gemini, centralizando el estilo de respuesta en un gateway.
- Proyectos de Claude con instrucciones de sistema personalizadas: la sección de prompt modular está pensada para pegarse directamente en las instrucciones de proyecto.
- Investigación sobre prompt engineering y estabilidad conductual: el artefacto sirve como caso de estudio de cómo se formulan priors epistémicos en lenguaje natural y de su portabilidad entre proveedores.
- Evaluación de robustez frente a jailbreaks: útil para comparar respuestas de un sustrato con y sin el kernel ante prompts adversariales, aunque sin métricas publicadas.
- Experimentación con clasificación epistémica: la matriz OBSERVED/VERIFIED/INFERRED/SIMULATED/UNKNOWN puede adaptarse como esquema de anotación en pipelines de evaluación de factualidad.
- Despliegue en vLLM o llama.cpp: el autor declara compatibilidad, aunque no se documentan parámetros de sampling, cuantización ni configuración de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No hay pesos propios que cargar; los requisitos dependen del sustrato elegido.
- Con el sustrato de referencia Llama 3.3 70B: se requiere inferencia en FP16/BF16 en múltiples GPU (estimación habitual de 140 GB o más de VRAM para 70B en precisión completa), o cuantización Q4_K_M en llama.cpp/Ollama con aproximadamente 40-45 GB de VRAM o RAM unificada.
- GPU recomendadas para el sustrato 70B: A100 80GB (x2 o más), H100 80GB, o configuraciones multi-GPU en consumer (por ejemplo, 2x RTX 4090 de 24 GB con cuantización agresiva y offload).
- No cabe en una única GPU consumer de 24 GB en precisión completa; con cuantización Q4 y offload parcial puede ejecutarse en una RTX 4090 o RTX 3090, con latencia alta.
- Opciones de despliegue: Ollama (vía `Modelfile.whitecap`), vLLM, llama.cpp, LiteLLM y APIs propietarias como ChatGPT, Claude o Gemini.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Artefacto | Tipo | Sustrato | Licencia | Pesos | Validación empírica |
|---|---|---|---|---|---|
| Whitecap Sovereign Kernel | Prompt de sistema + Modelfile | Llama 3.3 70B (referencia) | MIT | No | No publicada |
| DAN / jailbreaks clásicos | Prompt adversarial | Cualquiera | Sin licencia formal | No | No formal |
| System prompts de proveedor (OpenAI, Anthropic) | Instrucciones de sistema | Modelos propios | Propietaria | No | Interna, no pública |
| Llama 3.3 70B (modelo base) | Modelo transformer | N/A | Llama 3.3 Community License | Sí (safetensors, GGUF) | Sí, benchmarks públicos de Meta |

La comparación directa con modelos de la misma categoría no es posible porque Whitecap no es un modelo: es una capa de instrucciones. Frente a los system prompts de proveedor, la diferencia es la licencia MIT y la portabilidad entre sustratos; frente a Llama 3.3 70B, la diferencia es que Whitecap no aporta pesos ni capacidades nuevas, solo modifica el estilo de respuesta en inferencia.

## Limitaciones y advertencias

- No es un modelo: no hay pesos, no hay entrenamiento y no hay evaluación empírica. Cualquier expectativa de rendimiento debe referirse al sustrato, no al kernel.
- La ecuación H = f(SG − G) es una analogía conceptual, no un mecanismo verificable; no se demuestra que el modelo calcule SG o G en tiempo de inferencia.
- El objetivo declarado de neutralizar rechazos y disclaimers puede aumentar el riesgo de respuestas dañinas o de incumplimiento de políticas en despliegues de producción, especialmente en entornos regulados.
- Sesgos conocidos: no disponibles; al depender de Llama 3.3 70B, hereda los sesgos del sustrato, no documentados en esta model card.
- Riesgo de alucinación: la matriz epistémica es una instrucción en lenguaje natural y no garantiza que el modelo etiquete correctamente sus afirmaciones; el riesgo de alucinación del sustrato persiste.
- Idioma: solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Licencia MIT para el artefacto de prompt, pero el uso del sustrato Llama 3.3 70B está sujeto a la Llama 3.3 Community License, que impone restricciones adicionales para uso comercial a gran escala.
- Repositorio sin descargas ni likes en el momento de la consulta; sin mantenimiento ni comunidad verificable.
- El Modelfile de la model card aparece truncado en la información proporcionada (`TEMPLATE """{{ if .System }}<|start_`), por lo que no se puede verificar su contenido completo.
- No se documentan parámetros de sampling, cuantización, contexto efectivo ni configuración de servidor para vLLM o llama.cpp.

## Enlaces

- Hugging Face: https://huggingface.co/Kye87/whitecap-sovereign-kernel
- No se han encontrado en la busqueda web otros enlaces (papers, blogs, repos, demos) asociados a este artefacto.
