# Jrouth/Qwen3.8-Flash-Next-MTP-C2T8-refit-GGUF

## Resumen

`Jrouth/Qwen3.8-Flash-Next-MTP-C2T8-refit-GGUF` no es un modelo de lenguaje completo, sino una **cabeza de predicción multi-token (MTP) reajustada** que se usa como *drafter* en decodificación especulativa para el modelo `Qwen/Qwen3.8-Flash-Next` de Alibaba (Qwen). El autor del reajuste es el usuario de HuggingFace Jrouth, y el trabajo se apoya en `llama.cpp-lab`, una bifurcación de llama.cpp con soporte experimental de MTP para la arquitectura Qwen4Exp. El repositorio contiene un único fichero GGUF, `mtp-Qwen3.8-Flash-Next-Q4DRAFT-refit0930.gguf`, de 2,48 GiB.

El problema que resuelve es muy concreto: al recuantizar un modelo, su distribución de salida se desplaza ligeramente y la cabeza MTP original —entrenada contra los pesos bf16 de referencia— pasa a producir borradores que el modelo objetivo acepta con menos frecuencia, sobre todo en las posiciones 2 y 3 del borrador. Este repositorio reajusta la cabeza contra las predicciones del propio modelo recuantizado (receta C2T8), recuperando tasa de aceptación y, con ella, velocidad de decodificación.

Es relevante porque la decodificación especulativa es hoy una de las palancas prácticas más eficaces para acelerar inferencia local, y porque demuestra un flujo de trabajo reproducible (extracción de tráfico, reentrenamiento de la cabeza y validación A/B) sobre hardware de consumo/entusiasta, en este caso una iGPU AMD Strix Halo con Vulkan. La mejora medida es modesta en velocidad (+3,4% ponderado por tiempo) y más clara en aceptación (0,651 a 0,692).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) de tipo transformer MoE, derivada de la correspondiente a Qwen3.8-Flash-Next; incluye atencion, proyeccion de embedding/hidden, mixers de hiperconexion, norms, router y experto compartido. Detalle de capas y dimensionalidad: no disponible |
| Parametros totales | 3.878.549.248 (~3,88 mil millones), segun el recuento real de safetensors indicado en la ficha de HuggingFace |
| Parametros activos | no disponible. El autor indica que se entrenaron 89 millones de parametros y que quedaron congelados los 512 expertos y las tablas de embedding/salida |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: expertos en q4_K/q5_0, resto en q8_0/f32. Objetivo recuantizado con la receta C2T8 |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-license-1.0 (etiquetada en HuggingFace como `license: other`) |
| Formato de pesos | GGUF (llama.cpp), un unico fichero de drafter; tamano 2,48 GiB, SHA-256 `260e61a89d40b5ae2e5d301f44ef9fc63bea2e808f5dda43897155b29c054020` |

## Arquitectura y entrenamiento

La cabeza MTP es un componente auxiliar que predice varios tokens por adelantado (profundidad 3 en esta configuración) para que el modelo objetivo los verifique en paralelo. Se trata de un *drafter*: el modelo objetivo revalida cada token propuesto, de modo que la cabeza **solo afecta a la velocidad, nunca a la salida**. El repositorio base, Qwen3.8-Flash-Next, es un MoE multimodal que sirve como avance de la arquitectura de Qwen4 y emplea atencion híbrida GDN + QSA (Gated DeltaNet + atención tipo QSA) según la documentación del repositorio oficial de Qwen.

El reajuste se realizó con 2 épocas (unos 20 minutos en la iGPU de un Strix Halo) sobre aproximadamente 400.000 posiciones de tráfico de agente generado por el propio modelo, renderizado a través de su plantilla de chat. La función de pérdida es entropía cruzada suave contra la distribución top-20 del modelo objetivo en las profundidades de borrador 1 a 3, desenrollada tal y como opera la caché KV del drafter. Se entrenaron 89 millones de parámetros; permanecieron congelados los 512 expertos y las tablas de embedding/salida. El pipeline completo está documentado en el repositorio `llama.cpp-lab` (`tools/mtp-dump`, `scripts/mtp-refit/`, `docs/flash-next-mtp-refit.md`).

## Capacidades

- Generación de borradores multi-token (profundidad 3) para decodificación especulativa sobre Qwen3.8-Flash-Next.
- Aceleración de la decodificación en llama.cpp mediante `--spec-type draft-mtp`, sin alterar la salida del modelo objetivo.
- Mejora de la tasa de aceptación de borradores por posición: 0,871 / 0,810 / 0,771 en las posiciones 1, 2 y 3 (frente a 0,839 / 0,781 / 0,741 de la cabeza original).
- Carga como modelo secundario (`-md`) junto al GGUF objetivo, con `-ngld` para descargar las capas del drafter en GPU.
- Funcionamiento sobre GPU integrada (medido en AMD Strix Halo con backend Vulkan y llama.cpp-lab).
- No soporta tool calling, agentes, visión, audio ni generación de texto autónoma por sí mismo: es exclusivamente un componente de inferencia.
- Capacidades multilingües: no disponibles (heredadas del modelo objetivo, no documentadas para esta cabeza).

## Casos de uso

- Aceleración de agentes de terminal en local: el repositorio está ajustado precisamente contra tráfico de agente (~85% del corpus de entrenamiento son tareas de terminal), por lo que es el escenario donde la tasa de aceptación medida es más representativa.
- Servidores de inferencia autoalojados con llama.cpp: añadir `-md` al `llama-server` incrementa la aceptación de borradores de 0,651 a 0,692 y el caudal ponderado de 38,7 a 40,0 tok/s con el mismo servidor y las mismas 12 peticiones.
- Despliegue en hardware de gama entusiasta o integrado: al ocupar 2,48 GiB adicionales, el drafter es viable en equipos con memoria unificada (probado en iGPU Strix Halo con Vulkan), donde un segundo modelo completo no cabría.
- Pipelines de generación de código asistida en local: al reducir el coste por token decodificado, mejora la latencia percibida en tareas de completado largo con el modelo objetivo recuantizado.
- Evaluación de técnicas de decodificación especulativa: sirve como caso de estudio reproducible de reajuste de cabezas MTP tras una recuantización, con pipeline publicado.
- Investigación sobre deriva de distribución por cuantización: permite medir cómo cambia la aceptación por posición de borrador (1, 2 y 3) al pasar de bf16 a una receta C2T8.
- Reproducción de un flujo de fine-tuning en iGPU: el entrenamiento completo (2 épocas sobre ~400k posiciones) se ejecutó en unos 20 minutos en una GPU integrada, lo que documenta un caso de ajuste ligero asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a un componente drafter. Los únicos datos cuantitativos son de aceptación y velocidad, medidos por el autor.

A/B en vivo sobre el mismo servidor y 12 peticiones reales de agente (solo cambia el fichero del drafter; AMD Strix Halo, Vulkan, llama.cpp-lab, profundidad MTP 3, np1):

| Metrica | Cabeza original | Esta cabeza |
|---|---|---|
| Aceptacion de borradores (contadores del servidor) | 0,651 (9241 / 14190) | 0,692 (8215 / 11871) |
| Decodificacion ponderada por tiempo | 38,7 tok/s | 40,0 tok/s (+3,4%) |
| Decodificacion, mediana por peticion | 40,7 tok/s | 41,6 tok/s (+2,2%) |

Medición offline sobre tráfico de agente retenido (aceptación esperada por posición de borrador):

| Posicion | 1 | 2 | 3 | Aceptados por ronda de 3 tokens |
|---|---|---|---|---|
| Cabeza original | 0,839 | 0,781 | 0,741 | 1,979 |
| Esta cabeza | 0,871 | 0,810 | 0,771 | 2,119 |

El propio autor advierte que la ganancia de decodificación cae dentro de la banda de ruido de ±3% de la máquina, mientras que la ganancia de aceptación no.

## Requisitos de hardware

- VRAM adicional para el drafter: aproximadamente 2,48 GiB (tamano del fichero GGUF con expertos en q4_K/q5_0 y resto en q8_0/f32), sumados a la VRAM/RAM unificada que requiera el GGUF objetivo de Qwen3.8-Flash-Next.
- GPU objetivo del modelo completo: no disponible en la informacion proporcionada.
- Configuracion medida por el autor: AMD Strix Halo (iGPU, memoria unificada) con backend Vulkan y llama.cpp-lab.
- Compatibilidad con GPU de consumo: el drafter es pequeno, pero la viabilidad depende del modelo objetivo; con el objetivo recuantizado C2T8 en un equipo con memoria unificada suficiente, el conjunto es funcional. No se documentan pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: exclusivamente llama.cpp en la bifurcacion `llama.cpp-lab`, que incorpora soporte Qwen4Exp MTP; **no** esta soportado por el llama.cpp de upstream segun la model card. Compatibilidad con vLLM, TGI, Ollama u otros runners: no disponible.
- Comando de referencia: `llama-server -m <target gguf> -md mtp-Qwen3.8-Flash-Next-Q4DRAFT-refit0930.gguf -ngld 99 --spec-type draft-mtp --spec-draft-n-max 3 ...`
- Throughput medido: 40,0 tok/s ponderado por tiempo y 41,6 tok/s de mediana por peticion con el objetivo C2T8 en Strix Halo. Latencia no reportada.
- Ajuste de destino: la cabeza se reajusto especificamente contra el objetivo C2T8. Con otras cuantizaciones del modelo sigue funcionando, pero la ganancia no fue medida.

## Comparativa con modelos similares

La categoria aqui es "cabezas MTP / drafters GGUF para Qwen3.8-Flash-Next". Los datos de los distintos repositorios no proceden de un banco de pruebas comun, por lo que no son estrictamente comparables.

| Alternativa | Tipo | Tamano / cuantizacion | Aceptacion declarada | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (Jrouth) | Drafter MTP reajustado a objetivo C2T8 | 2,48 GiB; expertos q4_K/q5_0, resto q8_0/f32 | 0,692 en A/B en vivo; 0,871 / 0,810 / 0,771 por posicion en offline | qwen-community-license-1.0 | Requiere llama.cpp-lab; validado con 12 peticiones |
| Cabeza MTP original de Qwen3.8-Flash-Next | Drafter MTP de referencia | No disponible | 0,651 en vivo; 0,839 / 0,781 / 0,741 por posicion | qwen-community-license-1.0 | Base de comparacion del autor |
| `jamesrogers/Qwen3.8-Flash-Next-MTP-MXFP4-GGUF` | GGUF con la cabeza MTP de 2,6B integrada en el propio fichero | MXFP4; no disponible el tamano exacto | 0,93-0,99 declarados en trafico real por el autor del repositorio | No disponible en la informacion | No requiere `-md` ni parches; metricas no verificadas de forma independiente |
| `drluoto/Qwen3.8-Flash-Next-MTP-GGUF` | GGUF con soporte MTP | No disponible | No disponible | No disponible | Solo se dispone del enlace a la pagina de discusiones |
| Modelo objetivo `Qwen/Qwen3.8-Flash-Next` | MoE multimodal, arquitectura hibrida GDN + QSA | No disponible | No aplica | qwen-community-license-1.0 | Modelo completo que el drafter acelera |

## Limitaciones y advertencias

- No es un modelo generativo autonomo: solo produce borradores que el modelo objetivo verifica. No debe evaluarse con benchmarks de conocimiento ni usarse como sustituto del modelo completo.
- La validacion en vivo se limita a **12 peticiones** en una unica maquina; el autor reconoce que la ganancia de decodificacion (+3,4% ponderada, +2,2% en mediana) queda dentro de la banda de ruido de ±3% de ese equipo.
- El corpus de entrenamiento es mayoritariamente trafico de agente de terminal (~85%). El comportamiento en otras cargas de trabajo no fue medido.
- El reajuste esta calibrado contra el objetivo recuantizado C2T8; con otras cuantizaciones del modelo objetivo funciona, pero la ganancia no esta cuantificada.
- Dependencia de una bifurcacion no oficial: requiere `llama.cpp-lab` con soporte Qwen4Exp MTP, no incluido en el llama.cpp de upstream. Esto implica riesgo de mantenimiento, divergencia de API y falta de soporte en runners alternativos (vLLM, TGI, Ollama).
- Sesgos conocidos: no disponibles. Al no generar texto de forma autonoma, los sesgos del sistema final dependen del modelo objetivo.
- Riesgo de alucinacion: no aplica al drafter, ya que el objetivo revalida cada token; si aplica al modelo objetivo.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: se distribuye bajo Qwen Community License 1.0, derivada de Qwen3.8-Flash-Next. Es una licencia etiquetada como `other`, no una licencia de codigo abierto estandar; conviene revisar el texto completo antes de un uso comercial.
- Repositorio sin adopcion publica (0 descargas y 0 "me gusta" en el momento de la consulta) y sin actualizaciones desde el 30 de septiembre de 2026, segun los metadatos disponibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jrouth/Qwen3.8-Flash-Next-MTP-C2T8-refit-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pipeline y documentacion tecnica (llama.cpp-lab): https://github.com/routhjim/llama.cpp-lab
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- GGUF MTP alternativo (jamesrogers): https://huggingface.co/jamesrogers/Qwen3.8-Flash-Next-MTP-MXFP4-GGUF/blob/main/README.md
- GGUF MTP alternativo (drluoto): https://huggingface.co/drluoto/Qwen3.8-Flash-Next-MTP-GGUF/discussions
- Noticia sobre pesos GGUF con MTP: https://www.alextech.ai/en/news/qwen38-flash-next-mtp-gguf-weights-now-available/
