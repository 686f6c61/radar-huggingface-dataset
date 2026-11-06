# Sayonaraponytail/TEAR-SFT

## Resumen

TEAR-SFT es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo meta-llama/Meta-Llama-3-8B-Instruct, publicado por el usuario Sayonaraponytail en Hugging Face. Forma parte del proyecto TEAR (Temporal-aware Automated Red-teaming for Text-to-Video Models), un trabajo de investigacion orientado a la evaluacion de seguridad de modelos de generacion de video a partir de texto. El adaptador no es un modelo autonomo: requiere cargar el modelo base Llama 3 8B Instruct por separado y adjuntar los pesos LoRA.

El interes de este repositorio es acotado y de naturaleza investigadora. No se trata de un modelo de proposito general ni de un competidor de los Llama 3 publicados por Meta, sino de un artefacto de investigacion que permite reproducir parte del pipeline de red-teaming automatizado descrito en el paper asociado (arXiv:2511.21145). El adaptador se entrena para generar prompts adversarios orientados a la seguridad de modelos text-to-video, con especial atencion a la dimension temporal de estos sistemas.

La relevancia actual del artefacto radica en que el ecosistema de seguridad de modelos generativos de video esta menos desarrollado que el de modelos de texto o imagen, y herramientas como TEAR cubren ese hueco. Sin embargo, el repositorio tiene un alcance limitado: solo se publican los pesos SFT (no los de PPO), el idioma declarado es unicamente ingles y el numero de descargas es muy bajo (20 en el momento de la consulta), lo que sugiere un uso circunscrito a la comunidad de investigacion en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32) sobre transformer decoder-only Llama 3 8B Instruct |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Llama 3 8B Instruct soporta 8K tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3 Community License (license: llama3) |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft |
| Tamano del repositorio | 0.1 GB |
| Modulos objetivo del LoRA | q_proj, k_proj, v_proj, o_proj |
| Etapa de entrenamiento | SFT (supervised fine-tuning) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones de atencion q_proj, k_proj, v_proj y o_proj del modelo Llama 3 8B Instruct. Esta configuracion es habitual en adaptadores de bajo rango: se congela el modelo base y se entrenan matrices de baja dimension que modifican las proyecciones de query, key, value y output de cada capa de atencion. El resultado es un fichero de pesos de aproximadamente 0.1 GB que se carga con la libreria PEFT junto al modelo base en bfloat16.

El entrenamiento corresponde a una etapa de supervised fine-tuning descrita en el paper TEAR (Temporal-aware Automated Red-teaming for Text-to-Video Models). Segun la model card, el proyecto contempla tambien una etapa de PPO (reinforcement learning) cuyos pesos no se incluyen en esta release, ya que los autores estan trabajando en una extension de TEAR y los publicaran tras la publicacion de dicho trabajo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas adicionales como DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto condicionada al ajuste SFT del proyecto TEAR, orientada a la produccion de prompts y contenido relacionado con red-teaming de modelos text-to-video.
- Razonamiento en lenguaje natural heredado del modelo base Llama 3 8B Instruct (capacidad general del base, no especifica del adaptador).
- Soporte de tool calling y function calling heredado del base Llama 3 8B Instruct (no documentado de forma especifica para el adaptador).
- Capacidades de agente y razonamiento multi-paso limitadas a lo que el base Llama 3 8B Instruct ofrece; no se documentan mejoras especificas en el adaptador.
- Capacidades multilingues: solo ingles declarado en la model card.
- Capacidad especial: generacion de prompts adversarios con conciencia temporal para evaluacion de seguridad de modelos text-to-video, segun el proposito del proyecto TEAR.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Evaluacion de seguridad de modelos text-to-video: el adaptador se usa para generar prompts adversarios que permitan auditar el comportamiento de generadores de video ante entradas potencialmente inseguras, aprovechando el enfoque temporal-aware de TEAR.
- Investigacion academica en red-teaming automatizado: sirve como componente reproducible en experimentos que comparen estrategias de red-teaming para modelos generativos de video, citando el paper arXiv:2511.21145.
- Construccion de pipelines de auditoria de contenido: integrado en un sistema que genere lotes de prompts de prueba y evalue respuestas de modelos text-to-video antes de su despliegue.
- Reproduccion de resultados del paper TEAR: para validar la etapa SFT del pipeline descrito, aunque la etapa PPO no esta disponible en esta release.
- Desarrollo de filtros y clasificadores de seguridad: los prompts generados pueden usarse como datos de entrenamiento o evaluacion para clasificadores de contenido en plataformas de generacion de video.
- Formacion y concienciacion en seguridad de IA: generacion de ejemplos controlados de prompts adversarios en entornos educativos o de investigacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Llama 3 8B Instruct, los requisitos son los del modelo base. En bfloat16, el modelo base ocupa aproximadamente 16 GB de pesos, por lo que se recomienda al menos 16-24 GB de VRAM para inferencia comoda.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para el modelo base en bfloat16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16; en GPUs con 16 GB puede requerir cuantizacion del base (no documentada para este adaptador).
- Opciones de despliegue: carga via transformers + peft (como muestra la model card); el base puede servirse con vLLM o TGI y el adaptador aplicarse como LoRA, aunque no se documenta compatibilidad explicita con estos servidores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TEAR-SFT (este) | LoRA sobre 8B | No disponible | Red-teaming de modelos text-to-video | Llama 3 | Hugging Face, 20 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8K | Instrucciones generales | Llama 3 | Hugging Face, ampliamente usado |
| Adaptadores de red-teaming para texto (genericos) | Variable | Variable | Red-teaming de LLMs | Variable | No disponible comparativa directa |
| Adaptadores de seguridad para modelos de imagen | Variable | Variable | Red-teaming de text-to-image | Variable | No disponible comparativa directa |

No se dispone de informacion sobre benchmarks comparativos ni sobre adaptadores equivalentes especificamente disenados para red-teaming de modelos text-to-video, por lo que la comparativa se limita a la relacion con el modelo base.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere descargar y cargar meta-llama/Meta-Llama-3-8B-Instruct, cuyo acceso esta sujeto a los requisitos de Meta y a la Llama 3 Community License.
- Solo se publican los pesos SFT; los pesos PPO no estan disponibles, lo que limita la reproduccion completa del pipeline TEAR.
- El idioma declarado es unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- No se documentan sesgos especificos del adaptador, pero hereda los sesgos del modelo base Llama 3 8B Instruct.
- Riesgo de alucinacion inherente al modelo base; el adaptador no incorpora mecanismos de verificacion factual.
- Uso comercial restringido por la Llama 3 Community License; ademas, el proposito del adaptador (generacion de prompts adversarios) puede no ser adecuado para productos orientados al usuario final sin salvaguardas adicionales.
- Numero de descargas muy bajo (20) y ausencia de likes, lo que sugiere poca validacion por parte de la comunidad y ausencia de evaluaciones independientes.
- No se documentan requisitos de cuantizacion ni compatibilidad con servidores de inferencia de alto rendimiento (vLLM, TGI) para el adaptador.
- Fecha de creacion del repositorio: 2026-10-27, lo que indica que es un artefacto reciente y sin historial de uso extenso.

## Enlaces

- Hugging Face: https://huggingface.co/Sayonaraponytail/TEAR-SFT
- Paper: https://arxiv.org/abs/2511.21145
- PDF: https://arxiv.org/pdf/2511.21145
- Codigo TEAR: https://github.com/Orangestella/Video_RedTeam
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
