# DuoNeural/RMSN-SFT-d1024-depth15-205M

## Resumen

RMSN-SFT-d1024-depth15-205M es un modelo lingüístico experimental de pequeño tamaño (205 millones de parámetros) desarrollado por DuoNeural Lab. No emplea una arquitectura transformer convencional, sino una RMSN (Resonant Metriplectic Sheaf Network), una topología basada en conceptos de sistemas dinámicos como redes mériplecticas, redes de haces (sheaf networks) y sistemas de Port-Hamiltonian. El modelo forma parte del "RMSN Depth Sweep", un estudio sistemático sobre la relación entre topología y profundidad con dimensión D=1024.

El problema que aborda es la investigación de arquitecturas alternativas al transformer para modelos pequeños orientados a razonamiento. Ha sido entrenado con SFT (supervised fine-tuning) durante 10.000 pasos sobre trazas de razonamiento "CDM v4-hard", y se evalúa con perplejidad en razonamiento CoT y retención sobre WikiText-103. Su relevancia es principalmente académica y exploratoria: permite estudiar regímenes de Omega > 1 en escalas pequeñas. La licencia MIT y el formato ligero (0,7 GB en el repositorio) lo hacen fácil de descargar y experimentar en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) |
| Parametros totales | 205M |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (evaluado sobre WikiText-103, presumiblemente ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (tamano del repositorio: 0,7 GB) |

## Arquitectura y entrenamiento

La arquitectura RMSN se aparta del transformer estándar: combina principios mériplecticos (que separan dinámicas conservativas y disipativas, al estilo de los sistemas Port-Hamiltonian) con redes de haces (sheaf networks), que modelan consistencia de información entre secciones locales. La configuración concreta usa D=1024 (dimensión), L=15 (profundidad) y Mw=64, con un cociente Omega = D/(Mw×L) ≈ 1,0667, situado en el régimen Omega > 1. Este modelo es el "escalón" de profundidad 15 dentro de un barrido sistemático de profundidades (rango 12-19) destinado a cerrar huecos en la escala.

El entrenamiento consistió en 10.000 pasos de SFT (supervised fine-tuning) sobre el dataset "CDM v4-hard reasoning traces", es decir, trazas de razonamiento difíciles, con semilla 1 para reproducibilidad. No se ha documentado el numero total de tokens, la fase de preentrenamiento previa, ni el uso de RLHF o DPO. Tampoco se describen en la model card innovaciones como decodificacion especulativa o mecanismos de atencion concretos, mas alla de la propia topologia RMSN.

## Capacidades

- Modelado de lenguaje en pequeño escala, con perplejidad medida sobre WikiText-103.
- Generacion de trazas de razonamiento tipo cadena-de-pensamiento (CoT), al haber sido afinado sobre trazas "CDM v4-hard".
- Capacidades de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el entrenamiento con trazas de razonamiento sugiere un enfoque en ese eje.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible; es un modelo de texto.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: el modelo sirve como punto de comparacion en el barrido de profundidad 12-19 para estudiar como cambia el rendimiento con la profundidad a Omega constante, y por eso es util para laboratorios academicos.
- Reproduccion de experimentos: con licencia MIT, semilla documentada (1) y configuracion publica (D=1024, L=15, Mw=64), permite replicar y verificar los resultados del estudio en hardware academico.
- Experimentacion en razonamiento ligero: al estar afinado sobre trazas CoT dificiles, puede usarse como base para estudiar distilacion de razonamiento en modelos de ~205M de parametros.
- Benchmarking de hardware modesto: con un peso de repositorio de 0,7 GB, es adecuado para probar pipelines de inferencia en CPUs o GPUs de consumo sin requerir infraestructura costosa.
- Estudio de dinamicas metriplecticas y Port-Hamiltonian en NLP: util para investigadores en sistemas dinamicos que quieran evaluar estas formulaciones aplicadas a modelado de lenguaje.
- Punto de partida para afinados propios: su tamano permite realizar SFT adicionales rapidamente y comparar contra el resultado publicado (CoT PPL 14,10).

## Benchmarks y rendimiento

Datos publicados en la model card:

| Metrica | Valor |
|---|---|
| CoT Reasoning PPL | 14,10 |
| WikiText-103 Retention PPL | 541,22 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones directas con modelos similares en la informacion disponible. La metrica de retencion sobre WikiText-103 (PPL 541,22) es una perplejidad muy alta, lo que indica que el modelo esta especializado en razonamiento CoT y no en modelado general de lenguaje natural.

## Requisitos de hardware

- VRAM estimada para inferencia: con 205M de parametros en precision FP16 (~0,4 GB de pesos), el modelo deberia ejecutarse en menos de 2 GB de VRAM; el repositorio completo ocupa 0,7 GB. No hay cifras oficiales.
- GPU recomendadas: no requiere GPUs de centros de datos; cualquier GPU moderna de consumo (RTX 3060, RTX 4090) o incluso CPU deberia ser suficiente. No hay estimaciones oficiales de latencia ni throughput.
- Cabe sin problema en GPUs de consumo; incluso la mayoria de portatiles con GPU dedicada podria ejecutarlo. En CPU es probablemente viable, aunque no hay datos publicados.
- Opciones de despliegue: no disponible de forma explicita. Al ser una arquitectura no standard (RMSN), no es previsible que funcione con vLLM, llama.cpp, Ollama o TGI sin soporte especifico; probablemente requiera el codigo del repositorio de DuoNeural.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Caracteristica | RMSN-SFT-205M | Pythia-160M (EleutherAI) | Qwen2.5-0.5B |
|---|---|---|---|
| Parametros | 205M | 160M | 494M |
| Arquitectura | RMSN (metriplectic/sheaf) | Transformer decoder | Transformer decoder (GQA) |
| Longitud de contexto | no disponible | 2048 | 32.768 (128.000 con RoPE scaling) |
| Razonamiento CoT afinado | Si (SFT sobre trazas hard) | No | Parcial en versiones instruct |
| Licencia | MIT | Apache 2.0 | Apache 2.0 |
| Ecosistema de despliegue | Limitado (arquitectura propia) | Amplio (HF, GPT-NeoX) | Muy amplio (vLLM, llama.cpp, etc.) |
| Benchmarks estandar | no disponible | Publicados y bien documentados | Publicados y bien documentados |

No hay comparaciones numericas directas publicadas frente a estos modelos, por lo que la tabla solo refleja caracteristicas documentadas publicamente.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al entrenarse con trazas de razonamiento sinteticas (CDM v4-hard), los sesgos del dataset de generacion se transferiran al modelo y no estan documentados.
- Riesgo de alucinacion: elevado y no cuantificado; es un modelo experimental de 205M parametros sin indicacion de alineacion (RLHF/DPO no consta).
- Limitaciones de contexto: la longitud de contexto no esta publicada; la perplejidad de retencion sobre WikiText-103 (541,22) sugiere una capacidad muy limitada de modelado de texto general.
- Idioma: no se declara soporte multilingue; la evaluacion sobre WikiText-103 apunta a ingles, por lo que su uso en castellano no esta garantizado ni evaluado.
- Licencia: MIT, sin restricciones de uso comercial.
- Caveats de produccion: no esta pensado para produccion. Es un artefacto de investigacion con 0 descargas, sin ecosistema de inferencia conocido (probablemente incompatible con vLLM, llama.cpp u Ollama) y sin documentacion de uso. La model card tampoco describe proceso de preentrenamiento, lo que dificulta evaluar su procedencia y calidad de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-d1024-depth15-205M
- Repositorio de codigo citado en la model card: https://github.com/DuoNeural/RMSN
- Contacto indicado por el autor: archon@agentmail.to
- Paper, demo o blog oficiales: no disponible
