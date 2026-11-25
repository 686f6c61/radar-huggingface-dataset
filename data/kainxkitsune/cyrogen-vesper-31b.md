# Kainxkitsune/Cyrogen-Vesper-31B

## Resumen

Cyrogen-Vesper-31B es un modelo de lenguaje de tipo dense (no MoE) de aproximadamente 30.700 millones de parametros, publicado por el usuario Kainxkitsune en Hugging Face. Se trata de un merge de dos modelos: ReadyArt/Vesper-31B-Nocturne y llmfan46/G4-MeroMero-31B-uncensored-heretic, ambos orientados a roleplay y contenido sin censura. El modelo se distribuye principalmente en formato GGUF y esta etiquetado como `gemma4`, lo que sugiere que la arquitectura subyacente deriva de la familia Gemma.

El modelo esta disenado especificamente para generacion de texto conversacional en ingles, con enfasis en roleplay, narrativa interactiva y contenido para adultos. No es un modelo de proposito general: su ecosistema de etiquetas (nsfw, adult-content, uncensored, not-for-all-audiences) indica que ha sido ajustado para eliminar los filtros de seguridad tipicos de los modelos base, lo que lo hace inadecuado para aplicaciones comerciales convencionales o entornos sin moderacion.

Su relevancia actual es limitada y de nicho: dentro de la comunidad de roleplay y generacion creativa sin restricciones, los merges de modelos de 30B en GGUF son populares porque permiten ejecucion local en hardware de consumo de gama alta. Sin embargo, la ausencia de benchmarks publicados, de documentacion tecnica detallada y de un proceso de entrenamiento verificable lo convierten en un artefacto de interes principalmente experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dense (derivada de Gemma, etiqueta `gemma4`) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | No aplica (modelo dense, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repo incluye cuantizaciones; no se detallan los niveles exactos) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tamano del repo: 208,7 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio. El modelo se describe como `dense` y `gemma4`, lo que apunta a una arquitectura transformer decoder-only de la familia Gemma, sin mezcla de expertos. Al tratarse de un merge, no ha sido entrenado desde cero: los pesos resultan de la combinacion de dos modelos base, ReadyArt/Vesper-31B-Nocturne y llmfan46/G4-MeroMero-31B-uncensored-heretic, presumiblemente mediante tecnicas de interpolacion de pesos (task arithmetic, SLERP o similares).

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en los modelos originales. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato verificable es el recuento de parametros real (30.697.345.596) obtenido de los safetensors, y el tamano del repositorio (208,7 GB), que sugiere la presencia de multiples cuantizaciones GGUF ademas de posibles pesos en precision completa.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Roleplay y narrativa interactiva: el modelo esta ajustado para mantener personajes, tono y estilo a lo largo de conversaciones largas.
- Contenido para adultos sin censura: las etiquetas `nsfw`, `uncensored` y `not-for-all-audiences` indican que se han reducido o eliminado los rechazos de seguridad.
- Generacion creativa: ficcion, descripcion de escenas y dialogos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de pensamiento explicito.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Roleplay conversacional local: el modelo puede ejecutarse en local mediante llama.cpp u Ollama con cuantizaciones GGUF, gestionando dialogos de personaje multi-turno sin dependencia de APIs externas.
- Escritura creativa asistida para ficcion adulta: util para autores que necesitan generar borradores de escenas y dialogos sin las restricciones de los modelos alineados comercialmente.
- Prototipado de chatbots de personaje: permite experimentar con personalidades y estilos narrativos en entornos controlados antes de invertir en ajuste fino sobre modelos con licencia mas clara.
- Investigacion sobre merges de modelos: sirve como caso de estudio de como la interpolacion de pesos de dos modelos uncensored afecta al comportamiento conversacional.
- Generacion de contenido para comunidades de rol por texto: integrable en plataformas de rol escrito que acepten modelos autoalojados.
- Evaluacion comparativa de cuantizaciones GGUF: el repositorio, con 208,7 GB, permite comparar calidad y velocidad entre distintos niveles de cuantizacion en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 30,7B parametros requiere aproximadamente 62 GB en FP16, unos 31 GB en cuantizacion de 8 bits y entre 18 y 20 GB en cuantizaciones de 4 bits (Q4_K_M).
- GPU recomendadas: A100 80 GB o H100 para precision completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas usando cuantizaciones Q4; en 16 GB solo con cuantizaciones agresivas (Q3 o inferiores) y posible degradacion de calidad.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; vLLM y TGI requeririan pesos en safetensors y no estan confirmados para este merge.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Cyrogen-Vesper-31B | ~30,7B | No disponible | Apache 2.0 | Roleplay sin censura (merge) |
| llmfan46/G4-MeroMero-31B-uncensored-heretic | ~31B | No disponible | No disponible | Roleplay sin censura (base del merge) |
| ReadyArt/Vesper-31B-Nocturne | ~31B | No disponible | No disponible | Roleplay narrativo (base del merge) |
| Gemma 2 27B (referencia de familia) | 27B | 8K tokens | Gemma license | Proposito general alineado |

La comparativa con modelos de proposito general no es directa: Cyrogen-Vesper-31B compite en el nicho de merges uncensored para roleplay, donde los criterios de evaluacion son subjetivos y no existen benchmarks estandarizados. Frente a sus dos modelos base, la diferencia principal es la combinacion de pesos, cuyo efecto cualitativo no esta documentado.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta explicitamente etiquetado como `nsfw` y `not-for-all-audiences`; no debe desplegarse en entornos accesibles a menores ni sin moderacion.
- Ausencia de alineacion de seguridad: al ser un merge de modelos uncensored, es probable que genere contenido danino, ilegal o eticamente problemático si se le solicita; no hay garantias de rechazo.
- Riesgo de alucinacion: sin benchmarks ni documentacion de entrenamiento, no hay evidencia sobre su fiabilidad factual; en tareas de conocimiento general es previsible que alucine.
- Solo ingles: la model card declara unicamente `en`; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Contexto desconocido: se desconoce la longitud de contexto efectiva, lo que impide planificar aplicaciones con ventanas largas.
- Licencia Apache 2.0 declarada, pero la procedencia de los pesos base y sus posibles restricciones no estan documentadas; conviene verificar la licencia de los modelos originales antes de un uso comercial.
- Sin benchmarks ni evaluaciones independientes: no hay datos objetivos de calidad, lo que desaconseja su uso en produccion sin evaluacion propia.
- Fecha de creacion futura (2026-11-21) en los metadatos: inconsistencia que sugiere que los datos del repositorio pueden no ser fiables.

## Enlaces

- Hugging Face: https://huggingface.co/Kainxkitsune/Cyrogen-Vesper-31B
- Modelo base 1: https://huggingface.co/llmfan46/G4-MeroMero-31B-uncensored-heretic
- Modelo base 2: https://huggingface.co/ReadyArt/Vesper-31B-Nocturne
