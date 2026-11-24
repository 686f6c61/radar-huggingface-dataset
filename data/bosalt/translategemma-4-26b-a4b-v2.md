# Bosalt/TranslateGemma-4-26B-A4B-v2

## Resumen

TranslateGemma-4-26B-A4B-v2 es un modelo de traduccion automatica publicado por el usuario Bosalt en Hugging Face, obtenido mediante un ajuste fino con LoRA sobre el modelo base unsloth/gemma-4-26B-A4B-it, una variante de la familia Gemma 4 con arquitectura Mixture-of-Experts (MoE). El checkpoint publicado es la fusion completa en BF16 de los adaptadores LoRA (205 pares de atencion/MLP y 60 pares MoE fusionados de 128 expertos), lo que da un modelo autonomo de 25.805.936.206 parametros totales con un repositorio de 51,6 GB. Esta especializado en traduccion multilingue y cubre diez idiomas: ingles, japones, coreano, indonesio, ruso, chino, aleman, espanol, frances y arabe.

El modelo resuelve el problema de la traduccion de alta calidad con fidelidad tecnica, especialmente en documentacion Markdown y contenido tecnico, un dominio donde los traductores genericos suelen degradar la estructura y los terminos especializados. El autor declara un entrenamiento con 0 % de fuga de datos respecto a WMT24++, lo que refuerza la validez de sus resultados de evaluacion. Es relevante ahora porque combina la eficiencia de un MoE (solo una fraccion de los parametros se activa por token) con un ajuste especifico de traduccion, y porque se distribuye como checkpoint BF16 listo para usar sin necesidad de aplicar adaptadores.

La ficha se basa exclusivamente en la informacion publicada en Hugging Face; los datos no declarados por el autor se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), basado en Gemma 4; 128 expertos en las capas MoE |
| Parametros totales | 25.805.936.206 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16; el modelo base admite cuantizaciones habituales de la familia Gemma, no confirmadas por el autor) |
| Idiomas soportados | en, ja, ko, id, ru, zh, de, es, fr, ar |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (BF16, checkpoint fusionado autonomo); libreria declarada: basalt |

## Arquitectura y entrenamiento

El modelo parte de unsloth/gemma-4-26B-A4B-it, un transformer con capas Mixture-of-Experts de 128 expertos. El ajuste se realizo con LoRA en dos componentes: 205 pares de adaptadores en capas de atencion y MLP, y 60 pares de adaptadores MoE fusionados con layout `rank_major`. El checkpoint publicado es la fusion completa en BF16 de esos adaptadores sobre el modelo base, de modo que no requiere cargar LoRA por separado. El nombre "A4B" del modelo base sugiere del orden de 4.000 millones de parametros activos por token, aunque el autor no lo confirma explicitamente en la informacion disponible.

El entrenamiento utilizo la curación de datos Belnap `SIXTEEN_3` sobre una mezcla de Unbabel/TowerBlocks-v0.2, Helsinki-NLP/un_pc (los seis idiomas oficiales de la ONU), Helsinki-NLP/opus-100 y documentacion tecnica Markdown de Basalt. El autor declara explicitamente un 0 % de fuga de datos de WMT24++ en el conjunto de entrenamiento. No se especifican el numero total de tokens de entrenamiento, la composicion exacta de la mezcla ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Traduccion automatica multilingue entre diez idiomas: en, ja, ko, id, ru, zh, de, es, fr y ar.
- Traduccion de documentacion tecnica en formato Markdown preservando estructura y terminos especializados, segun la evaluacion declarada de fidelidad tecnica.
- Traduccion de pares de idiomas cubiertos por WMT24++ (los seis idiomas oficiales de la ONU mas japones, coreano, indonesio y aleman).
- Capacidades heredadas del modelo base Gemma 4 instruct (generacion de texto, razonamiento, codigo), aunque no estan evaluadas ni documentadas por el autor para este checkpoint.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Localizacion de documentacion tecnica: el modelo esta entrenado especificamente sobre Markdown tecnico y declara un 99,2 % de fidelidad tecnica en las pruebas del autor, por lo que es adecuado para traducir READMEs, guias de API y manuales manteniendo bloques de codigo, enlaces y estructura.
- Traduccion de articulos y notas de prensa multilingues: cubre los seis idiomas oficiales de la ONU, lo que permite un flujo unico para publicaciones institucionales en espanol, frances, ruso, chino, arabe e ingles.
- Internacionalizacion de productos digitales: traduccion de cadenas de interfaz y contenido de ayuda hacia japones, coreano e indonesio, mercados cubiertos por el modelo y frecuentemente desatendidos por traductores genericos.
- Traduccion de documentacion de software open source: el modelo puede integrarse en pipelines de CI/CD que generen versiones traducidas de la documentacion en cada release, dado su enfoque en Markdown tecnico.
- Traduccion de contenido editorial y marketing: para campanas que requieran versiones en frances, aleman o espanol con calidad superior a la de traductores genericos, con revision humana posterior.
- Procesamiento por lotes de corpus multilingues: al ser un checkpoint BF16 autonomo, puede desplegarse en infraestructura propia para traducir grandes volumenes de texto sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Traduccion WMT24++ (9 pares, 100 % sin fuga) | google/wmt24pp, split held-out-tail-40-per-pair | sacrebleu chrF++ | 48,07 |
| Traduccion WMT24++ (9 pares, 100 % sin fuga) | google/wmt24pp, split held-out-tail-40-per-pair | Unbabel/wmt22-comet-da | 0,8324 |
| Traduccion de Markdown tecnico | basalt-readme-i18n (ja, ko, id, ru), eval-12-probes | chrF++ | 81,86 |
| Traduccion de Markdown tecnico | basalt-readme-i18n (ja, ko, id, ru), eval-12-probes | Fidelidad tecnica (%) | 99,2 |

No se han publicado resultados comparativos con otros modelos de traduccion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo para pesos, mas memoria para el contexto y el runtime; se recomienda un minimo de 64-80 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con GPUs de 24-48 GB.
- En GPU de consumo: no cabe en BF16 en una RTX 4090 (24 GB). Requeriria cuantizacion (por ejemplo, 4 bits, del orden de 13-16 GB de pesos) para caber en GPUs de 24 GB, aunque el autor no publica versiones cuantizadas ni confirma su compatibilidad.
- Opciones de despliegue: la libreria declarada es basalt; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TranslateGemma-4-26B-A4B-v2 | 25,8 B (MoE) | no disponible | gemma | Hugging Face, safetensors BF16 |
| Alternativas de traduccion de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en la model-index).
- El modelo esta especializado en traduccion; su rendimiento en tareas generales de generacion, razonamiento o codigo no esta evaluado y puede degradarse respecto al modelo base.
- Cobertura limitada a diez idiomas; no se garantiza calidad fuera de ese conjunto.
- Riesgo de alucinacion y de omision de contenido en textos largos o con estructura compleja, no cuantificado por el autor.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos completos antes de un despliegue en produccion.
- El checkpoint es BF16 de aproximadamente 52 GB; el despliegue en hardware de consumo requiere cuantizacion no publicada por el autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bosalt/TranslateGemma-4-26B-A4B-v2
- Adaptadores LoRA: https://huggingface.co/Bosalt/TranslateGemma-4-26B-A4B-v2-LoRA
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Conjunto de datos WMT24++: https://huggingface.co/datasets/google/wmt24pp
- Conjunto de datos TowerBlocks: https://huggingface.co/datasets/Unbabel/TowerBlocks-v0.2
- Conjunto de datos un_pc: https://huggingface.co/datasets/Helsinki-NLP/un_pc
- Conjunto de datos opus-100: https://huggingface.co/datasets/Helsinki-NLP/opus-100
