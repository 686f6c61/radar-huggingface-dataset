# Aman90101/test

## Resumen

AuthorMist Originality es un ajuste fino del modelo Qwen2.5-3B-Instruct orientado a una tarea muy concreta: reescribir texto generado por IA para reducir su detectabilidad por parte de sistemas de deteccion de texto automatico, preservando el significado original. Lo desarrolla el equipo AuthorMist (autores citados: Isaac David y Arthur Gervais) y se distribuye bajo licencia MIT. El modelo parte de la arquitectura transformer decoder-only de Qwen2.5, con 3.085.938.688 parametros reales segun los pesos en safetensors.

La relevancia del modelo es doble: por un lado, es un ejemplo aplicado de ajuste mediante aprendizaje por refuerzo (GRPO) con una senal de recompensa externa no convencional (la salida de detectores de IA); por otro, plantea un caso de doble uso claro, ya que su proposito declarado es evadir Originality.ai y otros detectores. La model card lo enmarca como herramienta de investigacion sobre las limitaciones de los detectores y sobre privacidad del autor.

El repositorio de Hugging Face (Aman90101/test) parece una copia o espejo del modelo original publicado como authormist/originality; la model card mantiene las referencias al repositorio original. El modelo solo declara soporte para ingles y esta optimizado para textos de entre 100 y 500 palabras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), base Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Metodo de entrenamiento | GRPO (Group Relative Policy Optimization) con recompensa de detectores |
| Dataset de entrenamiento | checkgpt (10.000 abstracts humanos con sus versiones generadas por IA) |
| Longitud de texto objetivo | 100-500 palabras |
| Tamano del repo | 12,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only heredado de Qwen2.5-3B-Instruct, sin modificaciones estructurales documentadas. El ajuste se realiza mediante Group Relative Policy Optimization (GRPO), una variante de aprendizaje por refuerzo que estima la ventaja relativa dentro de un grupo de muestras generadas, evitando la necesidad de un modelo critico separado. La senal de recompensa proviene del feedback de detectores de texto IA, con foco declarado en los algoritmos de Originality.ai.

El conjunto de entrenamiento son 10.000 abstracts escritos por humanos del dataset CheckGPT junto con sus correspondientes versiones generadas por IA, cubriendo dominios como informatica, humanidades, ciencias sociales y fisica. No se especifica el numero total de tokens vistos durante el entrenamiento ni si hubo fases adicionales de SFT o DPO. La innovacion tecnica destacable es el uso de detectores como funcion de recompensa en RL, lo que convierte el problema de "humanizar" texto en un objetivo optimizable directamente.

## Capacidades

- Parafraseo orientado a reducir la detectabilidad por clasificadores de texto IA, con generalizacion cruzada entre detectores segun el autor.
- Preservacion semantica del texto original (similitud semantica declarada superior a 0,94).
- Generacion de texto fluido y coherente en ingles, heredada de la capacidad conversacional de Qwen2.5-3B-Instruct.
- Aplicable a dominios academicos, tecnicos y creativos segun la model card.
- Optimizado para entradas de 100 a 500 palabras.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue: solo se declara ingles.

## Casos de uso

- Investigacion sobre detectores de texto IA: usar el modelo como generador adversario para medir la robustez de clasificadores propios y calcular curvas AUROC/F1 frente a texto parafraseado.
- Auditoria de sistemas de deteccion en produccion: generar un corpus de textos "humanizados" para evaluar la tasa de falsos negativos de un detector antes de desplegarlo en un entorno educativo o editorial.
- Proteccion de privacidad de autor: reescribir borradores asistidos por IA para evitar que se infiera el uso de herramientas automaticas en contextos donde esa divulgacion no es obligatoria ni eticamente exigible.
- Estudio de sesgos de detectores: comprobar si ciertos dominios (humanidades frente a fisica) o longitudes de texto se ven mas penalizados por los clasificadores, usando el modelo para generar variantes controladas.
- Generacion de datos sinteticos para entrenar clasificadores mas robustos: producir pares (texto IA original, texto humanizado) como aumentacion de datos en el entrenamiento de detectores.
- Evaluacion de similitud semantica: banco de pruebas para metricas de preservacion de significado al reescribir abstracts academicos de 100 a 500 palabras.
- Analisis de doble uso y politicas: estudiar el impacto de tecnicas de evasion basadas en RL sobre los protocolos de integridad academica de una institucion.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son metricas de evasion frente a detectores, no benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K).

| Metrica | Valor declarado |
|---|---|
| AUROC medio (seis detectores) | 0,49 |
| F1 medio (todos los detectores) | 0,09 |
| Similitud semantica con el original | > 0,94 |
| AUROC frente a Hello SimpleAI | 0,07 |
| AUROC frente a Sapling | 0,13 |
| AUROC frente a Winston.ai | 0,35 |

Un AUROC proximo a 0,5 indica que el detector no distingue mejor que el azar entre texto original y humanizado; valores muy bajos (0,07, 0,13) indican que el detector clasifica el texto humanizado como humano de forma casi sistematica. No se han publicado resultados de benchmarks de capacidad general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 6,2 GB solo para pesos (3,086 mil millones de parametros), mas overhead de activaciones y cache KV; en la practica, 8-10 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3,5-4 GB de pesos; en 4 bits, en torno a 2 GB de pesos (aunque el repo no distribuye pesos cuantizados).
- GPU consumer: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 en fp16 o cuantizado; en GPUs de 8 GB conviene cuantizar.
- GPU de datacenter: A100, H100, L40S o A10G son sobradas para este tamano; utiles para servir muchas peticiones concurrentes.
- Despliegue: transformers (soporte nativo declarado), text-generation-inference (tag text-generation-inference), endpoints compatibles; vLLM y llama.cpp/Ollama son viables tecnicamente pero no estan documentados por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuthorMist Originality | 3,09 B | no disponible | Parafraseo anti-deteccion via GRPO | MIT | Hugging Face (repo espejo Aman90101/test; original authormist/originality) |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (segun documentacion de Qwen, no verificada aqui) | Instrucciones generales | Apache 2.0 (segun Qwen; no verificado en esta ficha) | Hugging Face |
| DIPPER (Krishna et al.) | 11 B | no disponible | Parafraseo de documentos largos | no disponible | Pesos publicados por los autores |
| Modelos de parafraseo genericos (p. ej. T5-large) | ~0,77 B | 512 tokens | Parafraseo supervisado | Apache 2.0 (T5) | Hugging Face |

La comparativa con DIPPER y T5 se ofrece como referencia de categoria; los datos de contexto y licencia de esos modelos no se han verificado en la informacion disponible y deben contrastarse antes de usarlos en produccion.

## Limitaciones y advertencias

- Solo soporta ingles; el uso en castellano no esta validado ni documentado.
- Optimizado para textos de 100 a 500 palabras; el comportamiento fuera de ese rango no esta caracterizado.
- Riesgo de deriva semantica: aunque declara similitud superior a 0,94, en parafraseo agresivo puede alterar matices, cifras o terminologia tecnica.
- Riesgo de alucinacion y de introducir afirmaciones no presentes en el texto original, especialmente en dominios especializados.
- Doble uso explicito: el modelo esta disenado para evadir detectores; su uso para misrepresentar autoria en contextos academicos o editoriales puede violar normas institucionales aunque la licencia sea permisiva.
- La licencia MIT permite uso comercial sin restricciones, lo que no exime de cumplir politicas de integridad academica, editoriales o contractuales.
- Los detectores evolucionan; las metricas de evasion publicadas pueden degradarse rapidamente con actualizaciones de los clasificadores.
- El repositorio Aman90101/test parece un espejo no oficial del original; conviene verificar integridad de pesos y procedencia antes de desplegarlo.
- No se documentan sesgos especificos, pero al heredar Qwen2.5-3B-Instruct arrastra los sesgos del modelo base y de los abstracts de CheckGPT.
- No hay garantia de que el texto generado pase controles humanos de calidad o de estilo; requiere revision editorial.

## Enlaces

- Repositorio en Hugging Face (espejo): https://huggingface.co/Aman90101/test
- Repositorio original citado en la model card: https://huggingface.co/authormist/originality
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset CheckGPT: https://huggingface.co/datasets/checkgpt (referencia del autor; no verificado)
- Paper citado: AuthorMist: Evading AI Text Detectors with Reinforcement Learning (David y Gervais, arXiv preprint, 2025); enlace no disponible en la informacion proporcionada
- Licencia MIT: https://opensource.org/licenses/MIT
