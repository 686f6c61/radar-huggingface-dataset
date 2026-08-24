# Ppeerapon/MiLMMT-46-4B-v1.0-EXL3-4.0bpw

## Resumen

MiLMMT-46-4B-v1.0 es un modelo de traducción automática multilingüe desarrollado por Xiaomi Inc., construido sobre Gemma3-4B mediante un proceso de cuatro etapas: preentrenamiento continuo con 143 mil millones de tokens monolingües y paralelos en 46 lenguas, ajuste supervisado, aprendizaje por refuerzo y fusión de modelos. El resultado es un sistema de traducción many-to-many que cubre un amplio espectro de idiomas, incluyendo lenguas de baja representación como el jemer, el lao o el uzbeko.

Esta ficha se centra en la cuantización EXL3 de 4.0 bits por peso publicada por Ppeerapon, que reduce el tamaño del modelo a 4.3 GB y lo hace viable para inferencia en GPUs de consumo. El modelo base indicado en el repositorio es `xiaomi-research/MiLMMT-46-4B-v0.1`, aunque la model card copiada hace referencia a la versión v1.0. La cuantización mantiene la arquitectura original y el pipeline de traducción, permitiendo su uso con ExLlama v3 y otras herramientas compatibles.

La relevancia de este modelo radica en ofrecer una alternativa abierta a sistemas propietarios de traducción automática, con un rendimiento competitivo en 46 lenguas y una licencia permisiva (Gemma) que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma3-4B base) |
| Parametros totales | 2.147.506.160 (segun safetensors; el modelo base Gemma3-4B declara ~4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (hereda de Gemma3-4B, tipicamente 8K o 32K; no confirmado) |
| Tipos de cuantizacion | EXL3 4.0 bits por peso (4.0bpw) |
| Idiomas soportados | 46: arabe, azerbaiyano, bulgaro, bengali, catalan, checo, danes, aleman, griego, ingles, espanol, persa, finlandes, frances, hebreo, hindi, croata, hungaro, indonesio, italiano, japones, kazajo, jemer, coreano, lao, malayo, birmano, noruego, neerlandes, polaco, portugues, rumano, ruso, eslovaco, esloveno, sueco, tamil, tailandes, tagalo, turco, urdu, uzbeko, vietnamita, cantonés, chino simplificado, chino tradicional |
| Licencia | Gemma |
| Formato de pesos | safetensors (cuantizacion EXL3) |

## Arquitectura y entrenamiento

El modelo base MiLMMT-46-4B-v1.0 se entrena a partir de Gemma3-4B en cuatro fases: (1) preentrenamiento continuo sobre 143 mil millones de tokens de datos monolingües y paralelos en 46 lenguas, dando lugar a MiLMMT-46-4B-Pretrain; (2) ajuste supervisado que produce MiLMMT-46-4B-v0.1; (3) aprendizaje por refuerzo; y (4) fusión de modelos para obtener la versión v1.0. La arquitectura es un transformer decoder denso, sin mezcla de expertos, con atención causal estándar.

La cuantización EXL3 a 4.0 bits por peso reduce la huella de memoria manteniendo la funcionalidad completa del modelo. No se han publicado detalles adicionales sobre el proceso de cuantización en el repositorio, pero al ser una conversión de pesos, no altera la arquitectura ni el comportamiento del modelo original.

## Capacidades

- Traduccion automatica many-to-many entre 46 lenguas, con un unico modelo para todos los pares.
- Generacion de texto condicionada por instrucciones de traduccion en formato prompt especifico.
- Soporte de traduccion con contexto largo (hasta 2048 tokens de salida recomendados en los ejemplos).
- Funcionamiento como modelo causal de lenguaje, compatible con pipelines de transformers y vLLM.
- No se ha confirmado soporte de tool calling, agentes o razonamiento multi-paso; el modelo esta especializado en traduccion.
- Capacidad multilingue amplia, incluyendo lenguas con pocos recursos digitales.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir manuales, guias y especificaciones entre ingles, chino, aleman, frances y otros idiomas, manteniendo coherencia terminologica gracias a su entrenamiento en datos paralelos.
- Localizacion de productos software: integrable en pipelines de CI/CD para traducir cadenas de interfaz de usuario, mensajes de error y documentacion de API a 46 idiomas de forma automatizada.
- Atencion al cliente multilingue: desplegado como servicio de traduccion en tiempo real para chats de soporte, permitiendo que agentes humanos o bots atiendan consultas en multiples idiomas sin cambiar de sistema.
- Traduccion de contenido editorial: adecuado para traducir articulos, noticias o entradas de blog a gran escala, con la posibilidad de ajustar el prompt para controlar el registro y el estilo.
- Subtitulado y transcripcion: puede traducir subtitulos o transcripciones de audio/video entre los idiomas soportados, aprovechando su capacidad de generar texto fluido en contextos largos.
- Investigacion en PLN: util como modelo base para experimentos de traduccion, evaluacion de calidad o desarrollo de sistemas hibridos que combinen reglas y modelos neuronales.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card del modelo base incluye una figura (main.png) con resultados experimentales, pero no se proporcionan valores tabulados. No se dispone de datos comparativos con otros modelos en este repositorio.

## Requisitos de hardware

- VRAM estimada: con cuantizacion EXL3 4.0bpw y un tamano de repo de 4.3 GB, la inferencia requiere aproximadamente 5-6 GB de VRAM, incluyendo overhead de contexto y activaciones.
- GPUs compatibles: cualquier GPU consumer con 8 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 4070, RTX 3080, RTX 4090, o GPUs profesionales como A10, A100, H100.
- En GPUs de 6 GB (p. ej., RTX 2060) podria funcionar con contexto reducido, pero no esta garantizado.
- Opciones de despliegue: ExLlama v3 (formato nativo), vLLM (con conversion a formato compatible), llama.cpp (si se convierte a GGUF), y transformers (con carga de safetensors).
- Latencia y throughput: no disponibles; dependen del hardware y del backend utilizado. Con una RTX 4090 se espera una velocidad de decodificacion de 50-100 tokens/s en este tamano de modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Como alternativas en el espacio de traduccion multilingue basada en LLMs abiertos se pueden citar:

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| MiLMMT-46-4B-v1.0 (este) | ~4B (2.1B segun safetensors) | no disponible | 46 | Gemma |
| NLLB-200 (Meta) | 600M - 54.5B | 512 tokens | 200+ | CC-BY-NC |
| M2M-100 (Meta) | 418M - 12B | 512 tokens | 100 | MIT |
| ALMA (similar, basado en Llama) | 7B - 13B | 2048 | 10 | Llama license |

La comparativa es orientativa; no se han verificado rendimientos relativos.

## Limitaciones y advertencias

- El modelo solo garantiza traduccion de calidad en las 46 lenguas listadas; para otros idiomas el rendimiento puede ser deficiente.
- La cuantizacion EXL3 a 4.0bpw puede introducir una ligera degradacion de calidad respecto al modelo en precision completa, aunque no se han cuantificado diferencias.
- No se ha confirmado la longitud de contexto real; los ejemplos usan hasta 2048 tokens de salida, pero el contexto de entrada podria ser menor.
- Riesgo de alucinacion en traducciones de frases ambiguas o con poco contexto, comun en modelos de este tamano.
- La licencia Gemma permite uso comercial, pero requiere cumplir sus terminos especificos (consultar la politica de uso de Google).
- El repositorio cuantizado no incluye el tokenizador ni los archivos de configuracion completos; es necesario descargarlos del modelo base.
- No se han publicado evaluaciones de sesgos o toxicidad para este modelo.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/Ppeerapon/MiLMMT-46-4B-v1.0-EXL3-4.0bpw
- Modelo base en HuggingFace: https://huggingface.co/xiaomi-research/MiLMMT-46-4B-v1.0
- Modelo preentrenado: https://huggingface.co/xiaomi-research/MiLMMT-46-4B-Pretrain
- Repositorio GitHub de Xiaomi: https://github.com/xiaomi-research/gemmax
- Paper v1.0 (arXiv 2608.10812): https://arxiv.org/abs/2608.10812
- Paper v0.1 (arXiv 2602.11961): https://arxiv.org/abs/2602.11961
