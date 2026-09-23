# rat-lab/mh-ec2-ttomd-K8-jk

## Resumen

`rat-lab/mh-ec2-ttomd-K8-jk` es un conjunto de adaptadores LoRA para el modelo `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`, publicado por el usuario `rat-lab` en HuggingFace. No se trata de un modelo completo, sino de un artefacto de investigación: los pesos resultantes de una celda concreta (K=8, estimador jackknife) de una tabla de experimentos de aprendizaje de preferencias sensible al riesgo, entrenada localmente por Max Horwitz en el clúster UW Hyak (trabajo SLURM 40292475, finalizado el 21 de septiembre de 2026).

El problema que aborda es el de la optimización de preferencias con cobertura y corrección de sesgo: en lugar de usar una única muestra o comparación por prompt, el entrenamiento emplea K=8 muestras por prompt (`--ypp_samples 8`) y una corrección de sesgo en dos escalas temporales (two-timescale) con estimador leave-one-out jackknife. El algoritmo base es online IPO (`--alg oipo1`, implementado en `risk_egpo/tt_omd.py`) con riesgo entrópico de parámetro tau = 10, sobre el dataset PKU-Alignment/PKU-SafeRLHF.

Su relevancia es estrictamente de reproducibilidad e investigación: el repositorio no tiene descargas ni "likes", no declara licencia ni idiomas, y su utilidad práctica pasa por cargarlo sobre el modelo base con PEFT. Resulta interesante para quienes estudian optimización de preferencias con aversión al riesgo y técnicas de reducción de varianza (jackknife) en RLHF, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder-only de la familia Gemma 2 (modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`) |
| Parametros totales | No disponible para el adaptador; el modelo base pertenece a la familia Gemma 2 2B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Gemma 2 2B) |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; admite fusion con el modelo base y conversion posterior a otros formatos |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) por checkpoint, mas ficheros de tokenizer |
| Tamano del repositorio | 1,0 GB (incluye 10 checkpoints) |
| Modelo base | `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` |
| Libreria | PEFT |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo entrenado de cero. La arquitectura subyacente es la del modelo base: un transformer decoder-only de la familia Gemma 2 en su variante de 2B, que a su vez procede de un ajuste supervisado (SFT) sobre el dataset Alpaca cleaned. Sobre ese punto de partida se inicializa el adaptador, con 1000 pasos de warmup partiendo desde cero.

El entrenamiento sigue el algoritmo online IPO (`--alg oipo1`, fichero `risk_egpo/tt_omd.py`) con las siguientes particularidades: cobertura K = 8 muestras por prompt, riesgo entrópico con tau = 10 (`--risk entropic --risk_c 10.0`), corrección de sesgo en dos escalas temporales mediante estimador leave-one-out jackknife, y tamano de paso de la escala temporal gamma = 0.1. La generación durante el entrenamiento se limita a 64 tokens nuevos. El dataset empleado es PKU-Alignment/PKU-SafeRLHF. La ejecución completa consta de 4680 pasos en un único trabajo, sin reanudaciones, con semilla 42, y genera 10 checkpoints (468, 936, ..., 4680, uno cada 468 pasos). El estado de reanudación de DeepSpeed no se incluye en el repositorio.

La innovacion tecnica destacable es, precisamente, la combinacion de cobertura K=8 con el estimador jackknife dentro de un esquema two-timescale para reducir la varianza del gradiente en optimizacion de preferencias con riesgo entropico. Es un diseno experimental orientado a controlar el sesgo de los estimadores de preferencia, no una mejora de eficiencia de inferencia.

## Capacidades

- Ajuste de preferencias sobre el modelo base: el adaptador modula el comportamiento del modelo SFT subyacente segun el objetivo de IPO con riesgo entropico (tau = 10), lo que se traduce en un sesgo hacia respuestas mas conservadoras o de menor varianza de recompensa.
- Generacion de texto condicionada por preferencias de seguridad: el entrenamiento usa PKU-SafeRLHF, por lo que el adaptador esta orientado a tareas de alineamiento y seguridad mas que a capacidades nuevas.
- No introduce capacidades nuevas respecto al modelo base: al ser un adaptador LoRA, hereda las capacidades del modelo `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (el modelo base deriva de un SFT sobre Alpaca cleaned, de perfil mayoritariamente anglofono, pero no se declara nada al respecto).
- Capacidades especiales (vision, audio, modo pensamiento): no disponible (no documentado).

## Casos de uso

- Investigacion en optimizacion de preferencias: reproducir la celda K=8 con jackknife de la tabla de experimentos y compararla con las celdas de menor cobertura para medir el efecto del estimador en la varianza del gradiente.
- Estudio de aversión al riesgo en RLHF: comparar los checkpoints 468 y 4680 del mismo run para observar como evoluciona el comportamiento bajo riesgo entropico tau = 10 a lo largo del entrenamiento.
- Analisis de algoritmos de RLHF alternativos a DPO/PPO: usar este adaptador como referencia de online IPO con correccion two-timescale frente a implementaciones estandar.
- Experimentos de reduccion de varianza: el estimador leave-one-out jackknife es el objeto de estudio, por lo que el adaptador sirve como material de comparacion contra estimadores plug-in sin correccion.
- Fine-tuning incremental sobre seguridad: partir de este adaptador para experimentos posteriores con PKU-SafeRLHF u otros datasets de preferencias, aprovechando que el punto de partida ya esta alineado.
- Docencia y divulgacion tecnica: ilustrar de forma tangible que es un adaptador LoRA, como se estructura un repositorio con multiples checkpoints y como se carga con PEFT sobre un modelo base.
- Evaluacion comparativa de metodos de debiasing: medir si la correccion two-timescale reduce el sesgo respecto a un entrenamiento IPO sin correccion sobre los mismos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada. El consumo viene determinado por el modelo base de la familia Gemma 2 2B, que en precision completa (FP16/BF16) requiere en torno a 5-6 GB de pesos, mas cache KV y activaciones.
- El adaptador LoRA anade un coste despreciable en memoria (decenas de MB) si se mantiene sin fusionar; si se fusiona con el modelo base, no anade nada.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo base, es esperable que quepa en GPU de consumo, pero no se documenta ninguna recomendacion concreta.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; depende del modelo base y de la precision elegida.
- Opciones de despliegue: carga con PEFT y Transformers segun el ejemplo de la model card (`PeftModel.from_pretrained` con `subfolder`); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este artefacto.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el repositorio ocupa 1,0 GB por incluir 10 checkpoints; cargar un unico checkpoint reduce considerablemente el espacio necesario.

Ejemplo de carga documentado por el autor:

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM
m = AutoModelForCausalLM.from_pretrained("vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT")
m = PeftModel.from_pretrained(m, "rat-lab/mh-ec2-ttomd-K8-jk", subfolder="checkpoint-4680")
```

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rat-lab/mh-ec2-ttomd-K8-jk` | Adaptador LoRA (online IPO, riesgo entropico, jackknife) | Adaptador sobre base de la familia Gemma 2 2B | No disponible | No disponible | Publicado en HuggingFace, 0 descargas |
| `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` | Modelo completo con SFT | Familia Gemma 2 2B | Heredado de Gemma 2 | No disponible en la informacion | Publicado en HuggingFace (modelo base) |
| Modelo Gemma 2 2B instruct original | Modelo completo instruct | Familia Gemma 2 2B | No disponible en la informacion | No disponible en la informacion | Publicado por Google |

No se dispone de informacion sobre otros adaptadores comparables de la misma categoria (misma celda experimental, mismo algoritmo) en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion: no declara licencia, idiomas, pipeline ni resultados de evaluacion.
- No incluye el modelo base: es imprescindible descargar `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` por separado y verificar los terminos de uso de dicho modelo antes de cualquier uso.
- El repositorio no declara licencia, por lo que las condiciones de uso comercial son indeterminadas y deben consultarse con el autor.
- Se desconoce el estado de reanudacion de DeepSpeed, que no esta incluido; la reproducibilidad exacta del entrenamiento puede verse afectada.
- Al ser un ajuste sobre preferencias de seguridad (PKU-SafeRLHF) con riesgo entropico y tau = 10, el adaptador puede producir respuestas excesivamente conservadoras o evasivas en dominios ajenos a la seguridad.
- Riesgo de alucinacion: no evaluado ni documentado; heredado del modelo base.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base.
- Cobertura K=8 con 64 tokens maximos de generacion durante el entrenamiento: el comportamiento aprendido esta calibrado para respuestas cortas, lo que puede degradar la calidad en generaciones largas.
- Sesgos conocidos: no documentados por el autor. Los del modelo base y del dataset PKU-SafeRLHF no se analizan en la informacion disponible.
- Sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta), lo que implica ausencia de verificacion externa.
- Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre este modelo (corresponden a resultados sobre el animal "rata"), por lo que no ha sido posible contrastar datos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-ec2-ttomd-K8-jk
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Dataset de entrenamiento (PKU-Alignment/PKU-SafeRLHF): https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Libreria PEFT: https://huggingface.co/docs/peft/index
- Documentacion de Gemma 2: https://ai.google.dev/gemma/docs
- Paper de IPO (Identity Preference Optimization): https://arxiv.org/abs/2310.12036
- Los resultados de busqueda web disponibles no aportan enlaces relevantes sobre este modelo.
