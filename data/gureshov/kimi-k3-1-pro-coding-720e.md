# gureshov/Kimi-K3.1-Pro-Coding-720E

## Resumen

Kimi-K3.1-Pro-Coding-720E es un derivado no oficial del modelo Kimi-K3.1-Pro de Moonshot AI, publicado por el usuario gureshov en Hugging Face. Se trata de una poda de expertos (expert pruning) sobre la arquitectura Mixture-of-Experts del modelo base, orientada especificamente a tareas de programacion y agentes de codigo. Cada una de las 92 capas MoE conserva 720 de los 896 expertos enrutados (una reduccion del 20 %), mientras que el resto de componentes (capas de atencion, expertos compartidos, embeddings, `lm_head`, torre de vision, tokenizer y plantilla de chat) permanecen identicos al modelo original.

El modelo mantiene el formato de cuantizacion MXFP4 QAT original (compressed-tensors `mxfp4-pack-quantized`) y reduce el tamano del checkpoint de aproximadamente 1,56 TB a 1,28 TB. Con 2,24 billones de parametros totales, es un modelo de escala frontera disenado para inferencia en infraestructura de datacenter, no para hardware de consumo. Su relevancia radica en que demuestra una via practica de especializacion mediante poda estructurada sin reentrenamiento, preservando el rendimiento en codigo a costa de degradar el conocimiento general.

La poda se valido contra el modelo completo en un 15 % reservado del corpus de calibracion. Los resultados muestran que la perplejidad en codigo apenas varia (+0,04 %), mientras que en texto general (Wikipedia) empeora un 6,4 % y la precision top-1 cae 8 puntos porcentuales. En sesiones de agente de codigo la precision top-1 baja entre 2,5 y 3 puntos. El autor recomienda explicitamente usar el modelo completo para tareas que no sean de programacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida: 69 capas KDA (Kimi Delta Attention) + 24 capas MLA/DSA |
| Parametros totales | 2.245.170.191.296 (2,24 B) |
| Parametros activos | 16 expertos activos por token (numero de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 QAT (compressed-tensors `mxfp4-pack-quantized`); tag `8-bit` en el repo |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3.1-Pro License (licencia `other`, Copyright (c) 2026 Moonshot AI) |
| Formato de pesos | safetensors (compressed-tensors), libreria transformers con `custom_code` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Kimi-K3.1-Pro base: un transformer con 92 capas MoE, cada una con 896 expertos enrutados de los que se activan 16 por token, combinado con un esquema de atencion hibrido que alterna 69 capas KDA (Kimi Delta Attention) y 24 capas MLA/DSA. Incluye ademas una torre de vision, lo que habilita la modalidad image-text-to-text declarada en el pipeline. El checkpoint resultante mantiene `num_experts: 720` en `config.json` y conserva intactos los pesos del router de los expertos mantenidos, los expertos compartidos, embeddings, `lm_head`, tokenizer y plantilla de chat.

El proceso de poda consistio en recopilar estadisticas del router del modelo completo sobre un corpus de codigo fuente y sesiones de agente de codigo. En cada capa MoE se conservaron los 720 expertos con mayor contribucion total (frecuencia de enrutamiento multiplicada por magnitud de salida) y se eliminaron los 176 restantes, renumerando los expertos supervivientes. Los expertos eliminados recibian de media el 6,9 % de las decisiones de enrutamiento (rango de 2,6 % a 11,7 % por capa). No se modifico ningun peso de los expertos conservados ni se realizo fine-tuning. El repositorio incluye un fichero `keep.json` con los indices originales de los expertos conservados por capa y estadisticas por capa, lo que permite reproducir el mapeo al modelo base.

## Capacidades

- Generacion de texto y razonamiento, con modo de razonamiento (`kimi_k3` reasoning parser) segun la configuracion del modelo base.
- Generacion de codigo y trabajo en sesiones de agente de codigo, dominio para el que fue podado.
- Tool calling / function calling mediante el parser de tool-calls `kimi_k3`.
- Razonamiento multi-paso y flujos de agente (tool calls encadenadas).
- Procesamiento de imagen y texto (pipeline image-text-to-text, torre de vision intacta).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidad de thinking mode: no confirmada de forma explicita en la informacion disponible.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede completar y razonar sobre codigo en sesiones multi-turno, ya que la poda preserva la perplejidad en codigo (+0,04 % frente al modelo completo) y mantiene intactos tokenizer y plantilla de chat.
- Agentes de codigo autonomos: soporta tool calling y razonamiento encadenado con una degradacion acotada (2,5-3 pp de precision top-1 en sesiones de agente), adecuado para pipelines que ejecutan tareas de refactorizacion o correccion de bugs.
- Revision de codigo automatizada en CI/CD: puede integrarse en pipelines para analizar diffs y sugerir cambios, aprovechando el formato MXFP4 y el soporte de SGLang con paralelismo de pipeline.
- Generacion de tests y documentacion tecnica: tareas de codigo y texto tecnico donde la perdida de conocimiento general no es critica.
- Migracion y modernizacion de codigo legacy: el modelo puede razonar sobre bases de codigo y proponer transformaciones, con la ventaja de un checkpoint un 18 % mas pequeno que el original (1,28 TB frente a 1,56 TB).
- Despliegue de agentes de codigo en infraestructura propia: al reducir el tamano del checkpoint, disminuye el coste de almacenamiento y de carga en entornos con multiples replicas, siempre que se disponga de GPUs Ampere o superiores.
- Analisis de capturas o diagramas tecnicos junto a codigo: la torre de vision intacta permite entrada image-text-to-text para interpretar diagramas de arquitectura o errores en pantalla.

## Benchmarks y rendimiento

Los unicos datos publicados son comparativas de perplejidad y precision top-1 frente al modelo completo en un 15 % reservado del corpus de calibracion:

| Dominio | Perplejidad vs. modelo completo | Precision top-1 vs. modelo completo |
|---|---|---|
| Codigo | +0,04 % (sin perdida) | dentro del ruido |
| Sesiones de agente de codigo (tool calls, razonamiento) | no peor | −2,5 a −3 pp |
| Texto general (Wikipedia) | +6,4 % | −8 pp |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 2,24 B de parametros en MXFP4, el checkpoint ocupa 1,28 TB, por lo que la inferencia requiere agregacion de memoria en multiples GPUs.
- GPU recomendadas: el autor solo ha probado el modelo con una build parcheada de SGLang sobre NVIDIA Ampere (sm80) con paralelismo de pipeline. Se espera que vLLM y SGLang estandar funcionen en Hopper y Blackwell, aunque no esta verificado.
- GPU de consumo: no cabe en ninguna GPU de consumo; el modelo exige un cluster multi-GPU de datacenter.
- Opciones de despliegue: SGLang (verificado con parche), vLLM (esperado, no verificado), transformers con `--trust-remote-code` y los parsers `kimi_k3`. No hay indicios de soporte en llama.cpp u Ollama por el formato MXFP4 y el tamano.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kimi-K3.1-Pro-Coding-720E | 2,24 B | no disponible | Kimi K3.1-Pro License | Hugging Face (422 descargas) |
| moonshotai/Kimi-K3.1-Pro (base) | no disponible | no disponible | Kimi K3.1-Pro License | Hugging Face (modelo oficial) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada. La comparativa directa con el modelo base se limita a los datos de perplejidad y precision de la seccion de benchmarks, y al tamano de checkpoint (1,28 TB frente a ~1,56 TB).

## Limitaciones y advertencias

- Derivado no oficial: no esta hecho, revisado ni respaldado por Moonshot AI.
- Degradacion en conocimiento general: +6,4 % de perplejidad y −8 pp de precision top-1 en Wikipedia; no debe usarse para escritura o tareas no tecnicas.
- Degradacion en agentes de codigo: perdida de 2,5-3 pp de precision top-1 en sesiones de agente, relevante en flujos con tool calls.
- Licencia restrictiva: la Kimi K3.1-Pro License impone condiciones sobre ingresos por Model-as-a-Service y sobre mostrar "Kimi K3.1-Pro" en productos comerciales grandes; afecta a cualquier uso del derivado.
- Soporte de despliegue limitado: solo probado con una build parcheada de SGLang en Ampere; el funcionamiento en vLLM/SGLang estandar sobre Hopper o Blackwell no esta verificado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en un modelo de esta escala y agravado en dominios fuera de codigo por la poda.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingue mas alla de la del modelo base.
- Longitud de contexto: no disponible en la informacion proporcionada.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gureshov/Kimi-K3.1-Pro-Coding-720E
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia (incluida en el repositorio): LICENSE del repositorio del modelo
- Fichero de mapeo de expertos: `keep.json` en el repositorio del modelo
