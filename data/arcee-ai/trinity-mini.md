# arcee-ai/Trinity-Mini

## Resumen

Trinity-Mini es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Arcee AI, con 26.000 millones de parametros totales y 3.000 millones activos por token. Es el modelo de tamano medio de la familia Trinity, una serie de pesos abiertos orientada tanto a entornos empresariales como a desarrolladores individuales. Emplea la arquitectura AfmoeForCausalLM, con 128 expertos en total (8 activos y 1 compartido), y una longitud de contexto de 128.000 tokens.

El modelo se entrena sobre 10 billones de tokens recopilados y curados en colaboracion con Datology, partiendo del dataset utilizado en AFM-4.5B y anadiendo datos adicionales de matematicas y codigo. El entrenamiento se ejecuto en un cluster de 512 GPU H200 gestionado por Prime Intellect, con paralelismo HSDP.

Su relevancia actual reside en la combinacion de un contexto muy largo (128k), un coste de inferencia contenido gracias a los 3B parametros activos y una licencia OpenMDW-1.1 que permite uso comercial. Esta afinado para razonamiento, aunque segun el autor consume un numero total de tokens similar al de modelos instruction-tuned comparables. Soporta 11 idiomas, incluido el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AfmoeForCausalLM (transformer MoE) |
| Parametros totales | 26.123.974.400 (26B) |
| Parametros activos | 3B |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | BF16 (referencia); GGUF con cuantizaciones tipo q4_k_m disponibles en el repo oficial |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (repo principal), GGUF (repo Trinity-Mini-GGUF) |

## Arquitectura y entrenamiento

Trinity-Mini es un transformer de tipo mezcla de expertos con 128 expertos, de los cuales 8 se activan por token mas 1 experto compartido, lo que da lugar a 3B parametros activos sobre un total de 26B. La implementacion es AfmoeForCausalLM, con codigo personalizado que requiere `trust_remote_code=True` y `transformers==4.57.1`. Un detalle tecnico relevante es el uso de sesgos de correccion por experto (`expert_bias`): el checkpoint los almacena en BF16, pero para inferencia sin cuantizar deben convertirse a FP32, mientras que los pesos de normalizacion y de router se mantienen en BF16.

El entrenamiento se realizo sobre 10 billones de tokens curados con Datology, partiendo del dataset de AFM-4.5B y anadiendo datos de matematicas y codigo. Se ejecuto en 512 GPU H200 con paralelismo HSDP. El modelo esta afinado para razonamiento, y el autor indica que, pese a ese enfoque, el consumo total de tokens en pruebas es similar al de modelos instruction-tuned competitivos. No se detalla en la informacion disponible si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Razonamiento: el modelo esta explicitamente afinado para tareas de razonamiento, con soporte de parser de razonamiento `deepseek_r1` en vLLM.
- Codigo y matematicas: el dataset de entrenamiento incorpora datos adicionales de ambas areas.
- Tool calling / function calling: vLLM lo soporta con `--enable-auto-tool-choice` y el parser `hermes`.
- Capacidades de agente: la combinacion de tool calling y contexto de 128k permite flujos multi-paso con historial largo.
- Multilingue: 11 idiomas (ingles, castellano, frances, aleman, italiano, portugues, ruso, arabe, hindi, coreano y chino).
- Contexto largo: hasta 128.000 tokens para documentos extensos o conversaciones prolongadas.
- No se ha documentado soporte de vision ni de audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: con 128k tokens de contexto puede mantener conversaciones multi-turno muy largas y arrastrar el historial completo sin truncar, manteniendo coherencia en soporte tecnico o de facturacion.
- Generacion de codigo en produccion: el soporte de tool calling con el parser `hermes` en vLLM permite integrarlo en pipelines de CI/CD para revision de parches, generacion de tests o resumen de cambios.
- Analisis de documentos extensos: informes, contratos o expedientes de decenas de miles de tokens caben en una sola ventana, lo que permite extraccion de datos y preguntas sobre el documento completo sin fragmentacion.
- Agentes multi-paso: la combinacion de razonamiento, tool calling y contexto largo lo hace adecuado para orquestar tareas con varias llamadas a herramientas y memoria de la sesion.
- Asistente de investigacion multilingue: al cubrir castellano, ingles, aleman, chino, arabe o hindi, puede resumir y comparar fuentes en varios idiomas dentro de la misma conversacion.
- Despliegue en hardware modesto para un modelo de 26B: al activar solo 3B parametros por token, es viable en configuraciones de una sola GPU de gama alta o en cuantizacion GGUF q4_k_m con llama.cpp o LM Studio, lo que facilita prototipos locales y entornos con presupuesto limitado.
- Razonamiento asistido en dominios tecnicos: con temperatura baja (0,15) y los parametros de muestreo recomendados, es util para resolver problemas de matematicas o logica paso a paso.

## Benchmarks y rendimiento

La model card incluye graficos de benchmarks, pero los valores numericos no estan disponibles en la informacion proporcionada; solo se indica que el modelo esta afinado para razonamiento y que su consumo de tokens es similar al de modelos instruction-tuned comparables.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 52 GB de pesos (el repo ocupa 52,3 GB), por lo que se necesita al menos una GPU de 80 GB (A100, H100, H200) para inferencia sin cuantizar con margen para cache KV.
- Cuantizacion GGUF q4_k_m: reduce el peso a una horquilla aproximada de 15-16 GB, lo que permite ejecucion en GPU consumer de 24 GB (RTX 3090, RTX 4090) o en CPU con RAM suficiente.
- GPU recomendadas: H200 o H100 para produccion en BF16; A100 80 GB como alternativa; RTX 4090/3090 para cuantizaciones de 4 bits.
- Despliegue: transformers 4.57.1 con accelerate 1.11.0, vLLM >= 0.11.1, llama.cpp desde la build b7061, LM Studio con runtime actualizado y API via OpenRouter.
- Parametros de muestreo recomendados: temperature 0,15, top_k 50, top_p 0,75, min_p 0,06.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada. A continuacion se comparan solo los atributos estructurales conocidos:

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trinity-Mini (Arcee AI) | 26B | 3B (MoE) | 128k | OpenMDW-1.1 | HF, vLLM, llama.cpp, LM Studio, OpenRouter |
| AFM-4.5B (Arcee AI) | 4,5B | no aplica (denso) | no disponible | no disponible | HF |
| Alternativas MoE de ~20-30B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con modelos de otros fabricantes no puede completarse con rigor porque la informacion proporcionada no incluye sus especificaciones ni resultados de benchmarks.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; como en cualquier modelo entrenado con datos web a gran escala, cabe esperar sesgos en dominios sensibles.
- Alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de fidelidad; el modo de razonamiento puede producir cadenas de pensamiento plausibles pero incorrectas.
- Contexto e idioma: aunque se declaran 11 idiomas, el rendimiento relativo por idioma no esta cuantificado; el castellano esta soportado pero no necesariamente al mismo nivel que el ingles.
- Licencia: OpenMDW-1.1 permite uso comercial, pero es una licencia propia con terminos especificos; conviene revisar el fichero LICENSE del repo antes de integrarlo en un producto.
- Detalles de implementacion: requiere `trust_remote_code=True` y una version concreta de transformers (4.57.1); el `expert_bias` debe convertirse a FP32 en inferencia sin cuantizar, y omitir este paso puede degradar la calidad.
- Produccion: no hay datos publicos de latencia, throughput ni estabilidad bajo carga, por lo que es necesario realizar pruebas propias antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arcee-ai/Trinity-Mini
- Modelo base: https://huggingface.co/arcee-ai/Trinity-Mini-Base
- Repo GGUF: https://huggingface.co/arcee-ai/Trinity-Mini-GGUF
- Blog de Arcee AI (The Trinity Manifesto): https://www.arcee.ai/blog/the-trinity-manifesto
- Chat de prueba: http://chat.arcee.ai/
- API en OpenRouter: https://openrouter.ai/arcee-ai/trinity-mini
- Datology (datos de entrenamiento): https://www.datologyai.com/
- Prime Intellect (infraestructura de entrenamiento): https://www.primeintellect.ai/
- AFM-4.5B: https://huggingface.co/arcee-ai/AFM-4.5B
- llama.cpp: https://github.com/ggml-org/llama.cpp/releases
