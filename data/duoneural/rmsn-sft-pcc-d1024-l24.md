# DuoNeural/RMSN-SFT-PCC-d1024-L24

## Resumen

RMSN-SFT-PCC-d1024-L24 es un checkpoint de ajuste supervisado (SFT) de la familia RMSN (Resonant Metriplectic Sheaf Network), desarrollado por DuoNeural Lab y publicado en noviembre de 2026. Se trata de un modelo de lenguaje de aproximadamente 261,9 millones de parametros con una dimension oculta de 1024 y 24 capas, entrenado especificamente sobre trazas de razonamiento de cadena de pensamiento (CoT) del dataset CDM tras un preentrenamiento con curriculo TATS.

La relevancia del modelo no reside en su tamano, sino en su propuesta arquitectonica: abandona el transformer convencional en favor de una geometria de haces (sheaf) con fibrados de Clifford Cl_{3,0}, un espacio de trabajo cuasiperiodico de Aubry-Andre con 64 slots y un optimizador Muon para los parametros metriplecticos. El autor documenta un hallazgo poco habitual: el ajuste supervisado reestructuro la topologia del checkpoint preentrenado (de "Partial-Chain-Cement-PCC" a una configuracion "Distributed Anchor"), mejorando drasticamente la perplejidad en CoT (de 3966 a 18,47) a costa de degradar la perplejidad en texto general (de 96,30 a 169,01).

Es un modelo de investigacion, en ingles, con licencia Apache 2.0, sin descargas ni likes en el momento de la consulta y sin paper publicado ("Paper forthcoming"). No dispone de pipeline declarado en Hugging Face ni de pesos en formatos estandar (safetensors/GGUF); el unico formato documentado es un `.pt` de PyTorch que requiere el codigo propietario `rmsn_core.py`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network): haces metriplecticos con fibrados de Clifford Cl_{3,0}, workspace cuasiperiodico de Aubry-Andre |
| Parametros totales | ~261,9 M (Muon 211,5 M + AdamW 50,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` de PyTorch (`rmsn_sft_best.pt`, con clave `model_state`); no se publican safetensors ni GGUF |
| Dimension oculta | 1024 |
| Profundidad | 24 capas |
| Slots de workspace | 64 |
| Vocabulario | 49.152 (tokenizer cosmo2: HuggingFaceTB/cosmo2-tokenizer) |
| Optimizador | Muon (parametros metriplecticos) + AdamW |
| Fase de entrenamiento | Phase 5b SFT Series |
| Tamano del repo | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura RMSN sustituye el bloque transformer clasico por una red de haces resonantes con estructura metriplectica (combinacion de dinamica conservativa y disipativa) sobre fibrados de Clifford Cl_{3,0}. El modelo incorpora un "workspace" cuasiperiodico de Aubry-Andre con 64 slots y un mecanismo de escaneo delta modulado por espinores. El entrenamiento se realizo en dos fases: un preentrenamiento con curriculo TATS y un ajuste supervisado posterior sobre trazas de razonamiento duro del dataset CDM. Los parametros metriplecticos se optimizaron con Muon (211,5 M) y el resto con AdamW (50,4 M).

El autor reporta que el checkpoint preentrenado presentaba una topologia de soliton denominada "Partial-Chain-Cement-PCC" y que los gradientes del SFT la reestructuraron hacia una configuracion "Distributed Anchor". La conclusion que extrae ("Law 10^103") es que el gradiente de SFT puede crear una topologia mejor que la seleccion de preentrenamiento, con un "cemento" M_eff=4 suficientemente entrenable para permitir una reestructuracion topologica completa. No se documentan numero de tokens de entrenamiento, composicion del dataset, ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles y razonamiento de cadena de pensamiento (CoT): el SFT se centro explicitamente en trazas de razonamiento duro, con una perplejidad CoT de 18,47 en el conjunto CDM.
- Razonamiento multi-paso: la arquitectura esta disenada para mantener un workspace de 64 slots que actua como memoria de trabajo durante el razonamiento.
- Modelado de lenguaje general: capacidad limitada tras el SFT, con perplejidad WikiText-103 de 169,01.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no, solo ingles declarado.
- Vision, audio u otras modalidades: no disponibles.
- Modo "thinking" explicito: no documentado como tal, aunque el entrenamiento en CoT sugiere comportamiento de razonamiento extendido.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas reproducible para estudiar geometrias de haces, fibrados de Clifford y dinamica metriplectica en modelos de lenguaje de ~262 M de parametros.
- Estudio de reestructuracion topologica por SFT: permite replicar el hallazgo del autor sobre como el ajuste supervisado modifica la topologia de solitones del preentrenamiento, util para lineas de investigacion en interpretabilidad estructural.
- Experimentos de razonamiento CoT a pequena escala: con 261,9 M de parametros y una perplejidad CoT de 18,47, es adecuado para prototipos de generacion de cadenas de razonamiento en entornos con recursos limitados.
- Docencia y formacion en geometria diferencial aplicada a ML: el codigo `rmsn_core.py` y la configuracion expuesta (`RMSNConfig`) permiten ilustrar conceptos de haces, Clifford y metriplectica en un modelo funcional.
- Reproduccion de resultados academicos: util para verificar las metricas reportadas (WikiText-103 y CDM CoT) antes de que se publique el paper anunciado.
- Base para ablaciones controladas: al ser un checkpoint SFT sobre un preentrenamiento conocido, permite comparar variantes D=1024/L=24 de la serie RMSN y analizar el impacto del SFT frente al preentrenamiento.

## Benchmarks y rendimiento

| Metrica | Base (preentrenamiento) | SFT |
|---|---|---|
| WikiText-103 PPL | 96,30 | 169,01 |
| CDM CoT Hard PPL | 3966 | 18,47 |

El autor indica que, en ranking de CoT, este checkpoint ocupa la posicion #6 entre todas las variantes RMSN con D=1024. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~261,9 M de parametros en fp32, el peso ronda 1,05 GB; en fp16 unos 524 MB; en int8 unos 262 MB. El repo ocupa 1,1 GB, coherente con pesos en fp32.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer con al menos 2-4 GB de VRAM libre deberia poder cargar el modelo en fp32, aunque no hay validacion publicada.
- Cabe en GPU consumer: previsiblemente si (RTX 3060, RTX 4060, RTX 4090, etc.), aunque no confirmado por el autor.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El unico camino soportado es cargar `rmsn_sft_best.pt` con PyTorch y el modulo `rmsn_core.py` (`ResonantMetriplecticSheafLM`), lo que exige el codigo propietario del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-SFT-PCC-d1024-L24 | ~261,9 M | no disponible | Apache 2.0 | `.pt` (PyTorch, codigo propietario) | Hugging Face, 0 descargas |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente disponible |
| SmolLM2-360M | ~362 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente disponible |
| TinyLlama-1.1B | ~1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente disponible |

La comparativa es estructural: RMSN se situa en el rango de 0,3-0,5 B de parametros, pero carece de contexto documentado, de formatos estandar y de benchmarks publicos que permitan una comparacion de rendimiento real con los modelos anteriores. No hay datos para afirmar superioridad o inferioridad en tareas estandar.

## Limitaciones y advertencias

- Modelo de investigacion sin paper publicado ("Paper forthcoming"): las metricas no han sido revisadas por pares.
- Degradacion severa en modelado de lenguaje general tras el SFT: WikiText-103 PPL pasa de 96,30 a 169,01, lo que sugiere sobreajuste al dominio CoT.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Formato de pesos no estandar (`.pt` con `model_state`) y dependencia de `rmsn_core.py`, que no se distribuye en el repo de Hugging Face; la carga requiere el codigo del autor.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de produccion habituales.
- Sin soporte documentado de tool calling ni de agentes.
- Riesgo de alucinacion no evaluado; no hay benchmarks de fidelidad ni de seguridad.
- Sesgos conocidos: no documentados.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la ausencia de codigo de inferencia publicado y de validacion practica desaconseja su uso en produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-PCC-d1024-L24
- Tokenizer cosmo2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Perfil del autor en Hugging Face: https://huggingface.co/DuoNeural
- Paper: no disponible (anunciado como "forthcoming")
- Repositorio de codigo (`rmsn_core.py`): no disponible publicamente
- Demo: no disponible
- Contacto indicado por el autor: archon@agentmail.to
