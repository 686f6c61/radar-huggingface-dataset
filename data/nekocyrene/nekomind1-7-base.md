# nekocyrene/NekoMind1.7-Base

## Resumen

NekoMind1.7-Base es un modelo de lenguaje causal preentrenado desarrollado por el usuario nekocyrene y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de la version base (preentrenada, sin ajuste por instrucciones) de la serie NekoMind1.7, construida sobre una arquitectura transformer decoder con mezcla de expertos (MoE). El modelo cuenta con 1.516.640.256 parametros totales (confirmados en los pesos safetensors) y aproximadamente 300 millones de parametros activos por token, lo que permite un coste de inferencia reducido en comparacion con un modelo denso equivalente.

La propuesta tecnica se apoya en 20 capas, de las cuales 18 incorporan bloques MoE con 32 expertos y enrutamiento top-4, mientras que las dos primeras capas permanecen densas para estabilizar la extraccion temprana de caracteristicas. Emplea Grouped Query Attention (8 cabezas de consulta y 4 de clave-valor), QK-Norm, SwiGLU, RMSNorm y RoPE con frecuencia base de 1.000.000, lo que le permite manejar una ventana de contexto de 32.768 tokens.

Es relevante ahora por su enfoque de eficiencia en la relacion capacidad/coste: ofrece la huella de parametros de un modelo de 1.5B con el coste computacional de uno de ~300M activos, lo que lo situa en la categoria de modelos compactos con atencion a despliegues en hardware limitado. Al ser un modelo base, esta pensado como punto de partida para fine-tuning posterior. El repositorio no registra descargas ni likes y no incluye datos de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con MoE (Mixture-of-Experts), RoPE, SwiGLU, RMSNorm, GQA y QK-Norm |
| Parametros totales | 1.516.640.256 (1,5B) |
| Parametros activos | ~300M por token |
| Parametros no de embedding | 1,47B |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 20 (2 densas + 18 con MoE) |
| Cabezas de atencion | GQA: 8 para Q, 4 para KV |
| Dimension de cabeza | 128 |
| Expertos | 32 (enrutamiento top-4) + experto compartido con gating |
| Tamano de vocabulario | 32.006 |
| Etapa de entrenamiento | Preentrenamiento (modelo base) |
| Libreria | transformers (custom_code) |

## Arquitectura y entrenamiento

NekoMind1.7-Base es un transformer decoder causal de 20 capas. Las dos primeras capas emplean un MLP denso con activacion SwiGLU, mientras que las 18 restantes utilizan bloques MoE con 32 expertos y enrutamiento top-4. Cada bloque MoE incorpora ademas un experto compartido con puerta sigmoide, de modo que siempre existe una base de conocimiento disponible con independencia de las decisiones del router. La atencion es de tipo GQA con 8 cabezas de consulta y 4 de clave-valor (dimension de cabeza 128), lo que reduce el uso de memoria del KV-cache. Se aplica RMSNorm a las proyecciones de consulta y clave (QK-Norm) para mejorar la estabilidad del entrenamiento, y RoPE con frecuencia base 1.000.000 para favorecer la extrapolacion en contextos largos. El LM Head esta atado a los pesos del embedding.

En cuanto a los datos de entrenamiento, la model card unicamente indica que se trata de un modelo preentrenado y no especifica el numero de tokens, la composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones (al ser una version base, es esperable que no las haya, pero no se confirma en la informacion disponible). Tampoco se detallan tecnicas adicionales como decodificacion especulativa o atencion lineal. Los detalles de innovacion documentados se limitan a las decisiones de diseno arquitectonico descritas: MoE con top-4 sobre 32 expertos, capas densas iniciales, experto compartido con gating y QK-Norm.

## Capacidades

- Generacion de texto causal: al ser un modelo base preentrenado, su funcion principal es la continuacion de texto y la modelizacion del lenguaje, no la respuesta a instrucciones.
- Razonamiento y conocimiento general: la arquitectura MoE con 32 expertos busca aumentar la capacidad efectiva frente a un modelo denso de tamano similar.
- Codigo y matematicas: no hay datos especificos publicados sobre rendimiento en estas tareas; se espera capacidad generica derivada del preentrenamiento, sin garantias.
- Soporte de tool calling / function calling: no disponible (requiere ajuste posterior, no documentado para esta version base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la version base.
- Capacidades multilingues: no disponibles; no se declara el conjunto de idiomas soportados.
- Capacidad especial: contexto largo de 32.768 tokens gracias a RoPE con base 1.000.000 y atencion GQA.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo base de 1,5B con licencia Apache 2.0, es adecuado como punto de partida para ajustar con SFT en dominios como derecho, medicina o soporte tecnico, aprovechando que solo se activan ~300M de parametros por token durante la inferencia.
- Investigacion en enrutamiento MoE: la configuracion concreta (32 expertos, top-4, experto compartido con gating y dos capas densas iniciales) lo convierte en un banco de pruebas util para estudiar balanceo de carga, colapso de expertos y estrategias de gating en modelos compactos.
- Experimentacion academica con presupuesto limitado: su tamano total de 1,5B y su coste de inferencia reducido permiten entrenar y evaluar variantes en una sola GPU consumer o en GPUs de gama media de centro de datos.
- Generacion de texto a gran escala con coste controlado: en tareas de autocompletado, resumen extractivo o generacion de borradores masivos donde el coste por token es critico, la activacion dispersa del MoE reduce el presupuesto de computo frente a un denso equivalente.
- Procesamiento de documentos largos: la ventana de 32.768 tokens permite alimentar articulos, informes o transcripciones extensas en una sola pasada para tareas de indexado, clasificacion o extraccion de caracteristicas.
- Componente base para pipelines de destilacion: puede emplearse como modelo profesor o alumno en experimentos de destilacion entre arquitecturas densas y MoE.
- Evaluacion de long-context: con RoPE base 1.000.000, sirve para medir degradacion de perplejidad en ventanas largas antes de aplicar tecnicas de extension de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 3,0-3,5 GB solo para pesos (1,5B parametros a 2 bytes), mas el KV-cache y activaciones. El KV-cache es reducido gracias a GQA (4 cabezas KV), lo que abarata el coste de contexto largo.
- VRAM en cuantizacion de 8 bits: del orden de 1,6-2,0 GB para pesos, aunque no se documentan pesos cuantizados oficiales.
- VRAM en cuantizacion de 4 bits: del orden de 0,9-1,2 GB para pesos, aunque tampoco se publican variantes GGUF o AWQ oficiales.
- GPU consumer: cabe con holgura en GPUs con 8 GB o mas (RTX 3060, 4060, 4070, 4080, 4090); en FP16 deberia funcionar incluso en tarjetas de 6-8 GB para contextos moderados.
- GPU de centro de datos: A100, H100, L40S o similares sobredimensionadas para inferencia; utiles para entrenamiento o fine-tuning.
- Opciones de despliegue: compatible con transformers al requerir custom_code (nekomind_moe). Para servidores de alto rendimiento seria necesario verificar soporte en vLLM o TGI, no confirmado en la informacion disponible. Para inferencia local se requeriria conversion a GGUF y soporte en llama.cpp/Ollama, no documentado.
- Latencia y throughput: no disponibles. Cabe esperar que, al activar solo ~300M parametros por token, el throughput sea sustancialmente superior al de un modelo denso de 1,5B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| NekoMind1.7-Base | 1,5B | ~300M | 32.768 | Apache 2.0 | MoE con 32 expertos, top-4, capas densas iniciales |
| Qwen2.5-1.5B | 1,5B | 1,5B (denso) | 32.768 | Apache 2.0 | Denso, ampliamente soportado y con benchmarks publicos |
| Qwen3-1.7B | 1,7B | 1,7B (denso) | 32.768 | Apache 2.0 | Denso, con modo thinking, benchmarks publicos |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32.768 | DeepSeek License | MoE, mucho mayor; referencia de la familia MoE compacta |

La comparacion con alternativas densas de ~1,5B es la mas directa por tamano, aunque NekoMind1.7-Base difiere en su filosofia MoE de activacion dispersa. No se dispone de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no sigue instrucciones de forma fiable y no debe desplegarse directamente en aplicaciones conversacionales sin ajuste previo.
- No se declaran idiomas soportados: no hay garantia de buen rendimiento fuera del idioma o idiomas del corpus de preentrenamiento, que no se documenta.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; al no haber pasado por fases de alineacion (RLHF/DPO) ni disponer de benchmarks, el riesgo es mayor en tareas factuales.
- Sesgos conocidos: no documentados por el autor; se asume el riesgo habitual de sesgos presentes en los datos de preentrenamiento, que no se especifican.
- Ausencia de datos de entrenamiento: no se indica numero de tokens, composicion del dataset ni procedencia de los datos, lo que dificulta evaluar calidad, cobertura y posibles problemas de licencia de los datos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario debe asumir la responsabilidad sobre el cumplimiento de las condiciones de los datos subyacentes, que se desconocen.
- Requiere libreria custom (`nekomind_moe`): el modelo depende de codigo personalizado dentro del repositorio, lo que puede complicar la integracion en frameworks de inferencia estandar (vLLM, TGI, llama.cpp) sin trabajo adicional.
- Sin cuantizaciones publicadas: no hay pesos GGUF, AWQ o GPTQ oficiales, lo que limita el despliegue inmediato en entornos de bajos recursos.
- Sin benchmarks ni evaluaciones de terceros: no hay evidencia publica de su calidad frente a alternativas establecidas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, con lo que no existe una comunidad que haya validado su funcionamiento.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/nekocyrene/NekoMind1.7-Base
- Licencia: https://huggingface.co/nekocyrene/NekoMind1.7-Base/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/nekocyrene
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
