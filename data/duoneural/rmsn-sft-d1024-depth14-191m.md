# DuoNeural/RMSN-SFT-d1024-depth14-191M

## Resumen

RMSN-SFT-d1024-depth14-191M es un modelo de lenguaje de pequeno tamano (191 M de parametros) desarrollado por DuoNeural Lab (Archon, Jesse Caldwell y Aura) y publicado bajo licencia MIT. Forma parte de un barrido sistematico de profundidad ("RMSN Depth Sweep") que estudia la relacion entre topologia y profundidad con una dimension de modelo fija D=1024. El modelo se presenta como un ejemplar de la arquitectura RMSN (Resonant Metriplectic Sheaf Network), una propuesta no convencional que combina conceptos de redes de haces (sheaf networks), sistemas metriplecticos y formulaciones port-hamiltonianas.

El modelo ha sido afinado con supervisión (SFT) durante 10 000 pasos sobre trazas de razonamiento del dataset interno CDM v4-hard, lo que lo orienta a tareas de razonamiento en cadena (chain-of-thought). Su configuracion concreta es D=1024, L=14 y Mw=64, con un parametro Omega = D/(Mw x L) aproximadamente igual a 1,1429, situado en el regimen Omega > 1.

La relevancia de este modelo es fundamentalmente de investigacion: explora una familia arquitectonica alternativa a los transformers convencionales y publica metricas de retencion de lenguaje (WikiText-103) junto con perplejidad en razonamiento CoT. No obstante, la informacion publica disponible es muy limitada y no se han publicado resultados de benchmarks estandar comparables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) |
| Parametros totales | 191 M (segun nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,7 GB; no se especifica safetensors ni GGUF) |

Parametros de configuracion adicionales publicados en la model card:

| Parametro | Valor |
|---|---|
| Dimension del modelo (D) | 1024 |
| Numero de capas (L) | 14 |
| Mw | 64 |
| Omega = D/(Mw x L) | ~1,1429 (8/7) |
| Semilla | 1 |
| Pasos de SFT | 10 000 |
| Dataset de SFT | CDM v4-hard (trazas de razonamiento) |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como una "Resonant Metriplectic Sheaf Network", una formulacion que combina redes de haces (sheaf networks) con estructura metriplectica y posiblemente port-hamiltoniana, segun las etiquetas del repositorio. Se trata de una propuesta alejada del transformer estandar, aunque la model card no detalla el mecanismo interno de atencion, la composicion exacta de capas ni los componentes matematicos concretos. El barrido de profundidad mantiene D=1024 fijo y varia el numero de capas, con el objetivo de estudiar el regimen Omega > 1 (en este caso Omega = 8/7).

El entrenamiento consistio en un afinado supervisado (SFT) de 10 000 pasos sobre trazas de razonamiento del dataset CDM v4-hard. No se especifica el numero total de tokens de preentrenamiento, la composicion del corpus base, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La model card unicamente reporta que esta variante obtiene la mejor retencion de WikiText-103 dentro de su lote del barrido.

## Capacidades

- Generacion de texto y modelado de lenguaje: el modelo reporta una perplejidad de retencion en WikiText-103 de 271,58, lo que indica capacidad de modelado basico pero limitada en comparacion con modelos de mayor tamano.
- Razonamiento en cadena (chain-of-thought): afinado especificamente sobre trazas de razonamiento (CDM v4-hard), con una perplejidad CoT de 15,35.
- Razonamiento multi-paso: orientado por diseno al SFT sobre trazas de razonamiento, aunque no se documentan evaluaciones cualitativas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Investigacion en arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar el comportamiento de redes RMSN frente a transformers de tamano comparable, especialmente en el regimen Omega > 1 y en barridos de profundidad con D fijo.
- Experimentos de razonamiento en cadena a pequena escala: su SFT sobre trazas CoT permite reproducir y analizar curvas de perplejidad en razonamiento con un coste computacional muy bajo (191 M de parametros).
- Prototipado rapido en entornos con recursos limitados: al ser un modelo pequeno, puede ejecutarse en CPU o en GPUs de gama baja para validar pipelines de generacion antes de escalar a modelos mayores.
- Estudio de retencion de conocimiento vs. especializacion: la comparacion entre perplejidad CoT (15,35) y retencion WikiText-103 (271,58) lo hace util para analizar el trade-off entre especializacion en razonamiento y olvido catastrofico.
- Docencia y divulgacion: adecuado para ilustrar arquitecturas no transformer y tecnicas de SFT en cursos o talleres, dado su tamano manejable y licencia permisiva.
- Base para fine-tuning experimental: al estar bajo MIT, puede servir como punto de partida para experimentos de ajuste en dominios concretos dentro de laboratorios de investigacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| CoT Reasoning PPL | 15,35 |
| WikiText-103 Retention PPL | 271,58 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones numericas con otros modelos del mismo barrido o de familias alternativas. No se deben inferir cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 191 M de parametros, en FP16 el modelo ocupa aproximadamente 0,4 GB de pesos; en FP32, unos 0,8 GB. La VRAM total necesaria depende del contexto y del backend, pero en la mayoria de configuraciones cabe en menos de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien puede ejecutarse en CPU sin problema.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: no se documentan backends oficiales. Al no especificarse el formato de pesos, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI; sera necesario verificar los archivos del repositorio (0,7 GB) antes de elegir el runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos publicados suficientes para establecer una comparativa rigurosa con alternativas de la misma categoria. La model card no incluye comparaciones con otros modelos del barrido RMSN ni con transformers pequenos de referencia, y no se han divulgado resultados en benchmarks estandar. Se indica por tanto "no disponible" en los campos comparativos.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados |
|---|---|---|---|---|
| RMSN-SFT-d1024-depth14-191M | 191 M | no disponible | MIT | Solo PPL CoT y WikiText-103 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Perplejidad de retencion en WikiText-103 muy alta (271,58), lo que sugiere una capacidad limitada de modelado de lenguaje general y un posible olvido catastrofico tras el SFT especializado en razonamiento.
- Riesgo elevado de alucinacion y de respuestas incoherentes fuera del dominio de las trazas de razonamiento del dataset CDM v4-hard.
- No se declaran idiomas soportados; se desconoce si el modelo maneja castellano u otros idiomas con calidad aceptable.
- No se especifica la longitud de contexto, lo que impide garantizar conversaciones multi-turno largas o documentos extensos.
- No hay informacion sobre sesgos, datos de preentrenamiento ni evaluaciones de seguridad.
- El formato de pesos no esta documentado, lo que puede complicar el despliegue en backends estandar.
- Aunque la licencia MIT permite uso comercial, el modelo es un artefacto de investigacion sin garantias de calidad para produccion; se recomienda evaluacion exhaustiva antes de cualquier uso real.
- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026, por lo que no existe validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-d1024-depth14-191M
- Repositorio GitHub citado: https://github.com/DuoNeural/RMSN
- Contacto indicado en la model card: archon@agentmail.to
