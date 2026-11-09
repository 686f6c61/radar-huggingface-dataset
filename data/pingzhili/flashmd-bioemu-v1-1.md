# pingzhili/flashmd-bioemu-v1.1

## Resumen

BioEmu 1.1 para FlashMD es un reempaquetado del modelo de puntuacion (score model) de BioEmu 1.1 de Microsoft, convertido al formato neutro que consume la libreria FlashMD sin necesidad de instalar el paquete `bioemu`. No se trata de un modelo de lenguaje ni de un transformer generico: es un modelo de difusion sobre SO(3) disenado para muestrear ensembles de equilibrio de estructuras proteicas, es decir, generar conformaciones alternativas plausibles de una proteina en lugar de una unica estructura estatica.

El problema que resuelve es el de la emulacion de dinamica molecular a coste reducido: en lugar de ejecutar simulaciones de dinamica molecular clasicas (costosas computacionalmente) o predecir una sola conformacion con AlphaFold2, BioEmu aprende a muestrear la distribucion de estados conformacionales que una proteina adopta en equilibrio. Esto es relevante para estudios de plegamiento, alosteria, diseno de farmacos y analisis de ensembles conformacionales.

Este repositorio concreto no aporta pesos nuevos: los pesos entrenados son identicos a los de `microsoft/bioemu` en la revision `1fec9d4473a9da04f5e60026a70d7a93fb893e9e`. Lo que anade es el fichero `tensors.pt` (state dict del score model mas las tablas de lookup SO(3) que necesita el sampler) y un `config.json` con la arquitectura, ajustes del SDE, ajustes del sampler y procedencia. El tamano del repo es de aproximadamente 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion sobre SO(3) (score model) para generacion de ensembles proteicos; arquitectura exacta no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo, sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | no aplica (modelo cientifico, no linguistico) |
| Licencia | MIT (Microsoft Corporation) |
| Formato de pesos | `tensors.pt` (dict plano de tensores cargable con `torch.load(..., weights_only=True)`), con claves `model/<name>` para el state dict y `sde/<name>` para las tablas SO(3); `config.json` asociado |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del score model de BioEmu mas alla de que opera como un modelo de difusion sobre el grupo SO(3) y que se condiciona sobre embeddings de secuencia de AlphaFold2 (ColabFold). FlashMD no calcula esos embeddings, por lo que el flujo de uso requiere obtenerlos por separado mediante `references/bioemu/embed.py` del repositorio de FlashMD. El sampler consume tablas de lookup SO(3) incluidas en el propio `tensors.pt` bajo el prefijo `sde/`.

Los pesos proceden del checkpoint original `checkpoints/bioemu-v1.1/checkpoint.ckpt` (SHA-256 `c2fa4e3094d5db1b465024b95d87b976272a2d9b63b7bbb8e97e98a192350fa2`) y `config.yaml` (SHA-256 `5273805bb70dd7b21e17a996dd486ae30bcf4c3f070f7159fb4ef204ce282482`) del repositorio `microsoft/bioemu`. La conversion se realizo con `references/bioemu/export.py` de FlashMD usando bioemu 1.4.1 y torch 2.10.0. El SHA-256 de `tensors.pt` generado es `6307bc068c918cd8c86fda6c42c8e8a2364798e75b32b629dd4f38fd6886ada7`.

No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF/DPO (no aplicables en este dominio). El trabajo original se describe en Lewis et al., "Scalable emulation of protein equilibrium ensembles with generative deep learning", Science (2025).

## Capacidades

- Muestreo de ensembles conformacionales de proteinas en equilibrio mediante difusion sobre SO(3).
- Generacion de multiples conformaciones plausibles para una misma secuencia, en lugar de una unica estructura estatica.
- Condicionamiento sobre embeddings de secuencia de AlphaFold2 (ColabFold), que deben calcularse externamente.
- Integracion directa con FlashMD mediante `flashmd.load("bioemu-v1.1")`.
- Carga sin dependencia del paquete `bioemu` original.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta vision, audio ni capacidades multilingues.
- No dispone de modo "thinking" ni de generacion de texto.

## Casos de uso

- Analisis de ensembles conformacionales: dado un embedding de secuencia de AlphaFold2, generar un conjunto de conformaciones para estudiar la variabilidad estructural de una proteina y detectar estados alternativos relevantes para su funcion.
- Estudio de alosteria y cambios conformacionales: muestrear estados minoritarios que una prediccion unica de AlphaFold2 no captura, utiles para identificar sitios alostericos.
- Diseno de farmacos basado en estructura: generar ensembles para docking contra multiples conformaciones del receptor, mejorando la cobertura de bolsas de union flexibles.
- Plegamiento y estabilidad proteica: comparar la distribucion de conformaciones muestreadas con datos experimentales (RMN, crio-EM) para validar hipotesis de plegamiento.
- Integracion en pipelines de investigacion con FlashMD: usar `flashmd.load("bioemu-v1.1")` para incorporar el sampler en flujos existentes sin gestionar la dependencia `bioemu`.
- Reproducibilidad y auditoria de resultados: al incluir SHA-256 de los ficheros de origen y del `tensors.pt` generado, permite verificar que los pesos coinciden con el checkpoint oficial de Microsoft.
- Emulacion de dinamica molecular a bajo coste: sustituir simulaciones MD largas por muestreo generativo en fases de cribado o exploracion inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de validacion, comparaciones numericas ni resultados de tests de calidad de ensembles (por ejemplo, cobertura de estados, divergencia con distribuciones experimentales o metricas de energia libre).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa aproximadamente 0,1 GB, pero el consumo real depende del tamano del batch de conformaciones y de los embeddings de AlphaFold2.
- GPU recomendadas: no especificadas en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada; dado el tamano reducido del repo (0,1 GB) es plausible que quepa en GPUs de consumo, pero no hay datos que lo garanticen.
- Opciones de despliegue: la via documentada es FlashMD (`flashmd.load("bioemu-v1.1")`) con PyTorch (probado con torch 2.10.0). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioEmu 1.1 para FlashMD (este repo) | Difusion SO(3) para ensembles proteicos | no disponible | no aplica | MIT | Hugging Face (`pingzhili/flashmd-bioemu-v1.1`) |
| BioEmu 1.1 original (`microsoft/bioemu`) | Difusion SO(3) para ensembles proteicos | no disponible | no aplica | MIT | Hugging Face y codigo de Microsoft |
| AlphaFold2 / ColabFold | Prediccion de estructura unica | no disponible | no aplica | no disponible en la informacion | Ampliamente disponible |

La comparacion con AlphaFold2 es relevante porque BioEmu se condiciona sobre sus embeddings y porque ambos abordan el problema de la estructura proteica desde angulos distintos: AlphaFold2 predice una conformacion (o un ensemble limitado via MSA), mientras que BioEmu muestrea la distribucion de equilibrio. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene pesos nuevos ni mejoras: es una conversion de formato de los pesos de `microsoft/bioemu`. Cualquier limitacion del modelo original aplica aqui.
- Requiere embeddings de secuencia de AlphaFold2 (ColabFold) calculados externamente; FlashMD no los genera, lo que anade un paso de preprocesado no incluido.
- No es un modelo de lenguaje: no admite prompts en texto, tool calling ni generacion de codigo. Cualquier expectativa en ese sentido es erronea.
- No se documentan sesgos especificos, pero como modelo entrenado sobre datos estructurales puede heredar sesgos del conjunto de entrenamiento original (no detallado en la informacion disponible).
- Riesgo de alucinacion estructural: como modelo generativo, puede producir conformaciones fisicamente implausibles o no representativas; se recomienda validacion con criterios fisicoquimicos.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright de Microsoft y citar el trabajo original (Lewis et al., Science 2025).
- No se documentan limitaciones de contexto o idioma porque no aplican al dominio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion comunitaria; conviene contrastar resultados con el repo oficial `microsoft/bioemu`.
- La fecha de creacion indicada (2026-11-09) y el uso de torch 2.10.0 deben tratarse con cautela si se reproducen los pasos de conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pingzhili/flashmd-bioemu-v1.1
- Repositorio original de BioEmu (Microsoft): https://huggingface.co/microsoft/bioemu
- FlashMD (UNITES-Lab): https://github.com/UNITES-Lab/flash-molecular-dynamics
- Referencia de embeddings de BioEmu en FlashMD: `references/bioemu/embed.py` (dentro del repo de FlashMD)
- Script de conversion: `references/bioemu/export.py` (dentro del repo de FlashMD)
- Paper: S. Lewis et al., "Scalable emulation of protein equilibrium ensembles with generative deep learning", Science (2025)
