# IsValorum/KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2-GGUF

## Resumen

KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2-GGUF es una cuantizacion personalizada de tipo GGUF del modelo Kwaipilot/KAT-Coder-V2.5-Dev, un modelo de lenguaje orientado a generacion de codigo y flujos agenticos. La publica el usuario IsValorum bajo el identificador APEX-I-MiniPlus V2, una receta de cuantizacion tensor a tensor que busca preservar la calidad del modelo original en un peso de aproximadamente 14,6 GB, apto para inferencia en hardware de consumo.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 34.660.610.688 parametros totales, etiquetado en el repositorio como "qwen35moe", lo que sugiere una arquitectura derivada de la familia Qwen con 35.000 millones de parametros y enrutamiento disperso. El contexto declarado alcanza los 256.000 tokens, una ventana pensada para trabajar sobre bases de codigo extensas y conversaciones multi-turno de largo recorrido.

La relevancia de esta ficha radica en que el autor ofrece una alternativa de cuantizacion "artesanal" frente a las recetas genericas de 3 bits, con proteccion de tensores sensibles: puertas de enrutamiento en F32 sin comprimir, cabeza de salida en Q6_K, puertas de atencion en Q8_0 y expertos principales en IQ3_XXS/IQ3_S. El repositorio incluye ademas benchmark propio (WikiText-2), proyecciones de rendimiento en hardware de consumo y una edicion hermana (V2.1) recomendada por el propio autor para streaming desde RAM del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), etiquetado "qwen35moe" |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | 256.000 tokens (declarado en la model card) |
| Tipos de cuantizacion | GGUF personalizado APEX-I-MiniPlus V2: F32 en router gates, Q8_0 en attention gates, Q6_K en output head, IQ3_S + IQ4_NL en shared experts, IQ3_XXS/IQ3_S en expertos principales |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (segun tags); la model card solo declara en y zh como idiomas principales |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 14,6 GB |
| Modelo base | Kwaipilot/KAT-Coder-V2.5-Dev |
| Cuantizado por | IsValorum |
| Herramienta de cuantizacion | unsloth-studio, con imatrix |
| Fecha de creacion | 16 de septiembre de 2026 |
| Ultima actualizacion | 11 de octubre de 2026 |
| Descargas / likes | 451 / 2 |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE). El repositorio no detalla el numero de expertos por capa, el numero de parametros activos por token ni la composicion exacta del dataset de entrenamiento; esa informacion no esta disponible en la model card consultada. El tag "qwen35moe" apunta a una arquitectura de la familia Qwen de aproximadamente 35.000 millones de parametros totales con enrutamiento disperso, y el contexto maximo declarado es de 256.000 tokens.

El trabajo de esta ficha es la cuantizacion, no el entrenamiento. La receta APEX-I-MiniPlus V2 aplica una asignacion de precision por tipo de tensor: los router gates se mantienen en F32 sin comprimir, la cabeza de salida (token output head) se protege en Q6_K, las puertas de atencion en Q8_0, los expertos compartidos en IQ3_S con IQ4_NL y los expertos principales en IQ3_XXS/IQ3_S. El autor indica que la cuantizacion se genero con unsloth-studio e imatrix, y que la edicion V2.1 hermana, con Q3_K lineal en expertos de borde y Q5_K en expertos compartidos, alcanza una perplexity de 5,5045 ± 0,1330 en WikiText-2, con una delta de aproximadamente +0,06 respecto al modelo sin cuantizar (unos 5,44). Para esta edicion V2 no se publica un valor de perplexity propio.

## Capacidades

- Generacion de codigo en multiples lenguajes, con enfasis en tareas de programacion y depuracion.
- Razonamiento de multiples pasos y flujos agenticos (tags "agentic" y "coding").
- Soporte de tool calling y function calling, segun la orientacion agentica del modelo base.
- Contexto largo de hasta 256.000 tokens, adecuado para analisis de repositorios completos.
- Capacidades multilingues: los tags declaran 13 idiomas, aunque la model card solo confirma en y zh.
- Inferencia compatible con llama.cpp y endpoints compatibles (tag "endpoints_compatible").
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede autocompletar y refactorizar codigo dentro de un editor con integracion via llama.cpp o un servidor compatible con la API de OpenAI, aprovechando la ventana de 256.000 tokens para incluir varios ficheros del proyecto en el contexto.
- Revision de repositorios completos: con contexto de 256.000 tokens es viable cargar un arbol de codigo amplio y pedir auditorias de seguridad, deteccion de deuda tecnica o explicaciones de arquitectura sin trocear el codigo en fragmentos.
- Agentes autonomos de CI/CD: el soporte de tool calling permite encadenar llamadas a herramientas (ejecutar tests, abrir pull requests, consultar logs) en pipelines automatizados de integracion y despliegue.
- Migracion de bases de codigo legacy: el modelo puede traducir modulos entre lenguajes o frameworks manteniendo la coherencia entre ficheros al disponer de todo el contexto en una sola ventana.
- Despliegue en estaciones de trabajo con 24 GB de VRAM: segun el autor, la edicion permite ejecutar el contexto completo de 256K en VRAM con una GPU de 24 GB, lo que habilita asistentes de codigo locales sin depender de la nube.
- Inferencia hibrida GPU + RAM del sistema: en equipos con DDR4/DDR5 y sin VRAM suficiente, los pesos pueden transmitirse desde RAM mientras la cache KV del contexto reside en GPU, con tasas de generacion declaradas de 20 a 45 tok/s.
- Generacion de tests y documentacion tecnica: a partir de un modulo completo en contexto, el modelo puede producir suites de pruebas y documentacion de API coherentes con el codigo existente.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) para esta edicion V2. El unico dato cuantitativo de calidad corresponde a la edicion hermana V2.1:

| Metrica | Valor | Notas |
|---|---|---|
| Perplexity WikiText-2 (V2.1) | 5,5045 ± 0,1330 | Delta aproximada de +0,06 frente al modelo sin cuantizar (aprox. 5,44) |
| Perplexity WikiText-2 (V2) | no disponible | El autor no publica valor propio para esta edicion |
| Throughput streaming en RAM (V2.1) | +24 a +28 tok/s | Frente a cuantizaciones con paradas de dequantizacion AVX2 |
| Throughput en RAM del sistema | 20 a 45 tok/s | Rango segun CPU, memoria y configuracion DDR4/DDR5 |

No se han publicado resultados de benchmarks de tareas (codigo, razonamiento, matematicas) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14,6 GB para los pesos en esta cuantizacion; el autor afirma que el contexto completo de 256K cabe en VRAM en una GPU de 24 GB, aunque la memoria adicional para la cache KV no se detalla.
- GPU recomendadas: el autor publica proyecciones para RTX 30, RTX 40 y RTX 50; una RTX 4090 (24 GB) es el caso destacado para contexto completo en VRAM. Para despliegues de mayor concurrencia, A100 o H100 son adecuadas por VRAM y ancho de banda, aunque no se publican cifras especificas para ellas.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090) y con margen ajustado en 16 GB si se reduce contexto o se hace offload parcial.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), servidores compatibles con endpoints OpenAI, y Ollama por compatibilidad de formato. vLLM y TGI no se mencionan en la informacion disponible para este GGUF.
- Latencia y throughput: 20 a 45 tok/s con inferencia total o parcial en RAM del sistema; el autor reporta +24 a +28 tok/s de mejora en streaming para la edicion V2.1 frente a cuantizaciones con paradas AVX2. No se publican cifras de throughput con todos los pesos en VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev APEX-I-MiniPlus V2 (esta ficha) | 34,66 B (MoE) | 256K | Apache 2.0 | GGUF, 14,6 GB | Cuantizacion artesanal con router F32 y output head Q6_K |
| KAT-Coder-V2.5-Dev APEX-I-MiniPlus V2.1 | 34,66 B (MoE) | 256K | Apache 2.0 | GGUF, aprox. 14,7 GB | Recomendada por el autor; PPL 5,5045 en WikiText-2; elimina paradas AVX2 |
| APEX-I-Mini generico de la comunidad | 34,66 B (MoE) | 256K | Apache 2.0 | GGUF | Expertos en IQ2_S, output head en Q3_K_M y atencion en Q3_K; el autor lo describe como inferior en calidad |
| Kwaipilot/KAT-Coder-V2.5-Dev (base sin cuantizar) | 34,66 B (MoE) | 256K | Apache 2.0 | safetensors | Referencia de calidad; PPL aproximada de 5,44 en WikiText-2 |

No se dispone de comparativas con otros modelos de codigo de tamano similar (por ejemplo, variantes de Qwen-Coder o DeepSeek-Coder) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits en los expertos principales introduce perdida de calidad respecto al modelo sin cuantizar; el autor cifra la delta de perplexity de la edicion V2.1 en aproximadamente +0,06, pero no publica el dato para esta V2.
- El autor advierte de que las recetas genericas de 3 bits provocan picos de perplexity, errores de sintaxis y corchetes de codigo rotos en modelos de razonamiento profundo; esta edicion mitiga el problema pero no lo elimina por completo.
- La model card solo confirma ingles y chino como idiomas principales; el resto de los 13 idiomas aparece unicamente en los tags y no esta validado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en generacion de codigo puede producir APIs inexistentes o dependencias no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Kwaipilot/KAT-Coder-V2.5-Dev antes de desplegarlo en produccion.
- El rendimiento en RAM del sistema depende de la CPU y del ancho de banda de memoria (DDR4 frente a DDR5); las cifras de 20 a 45 tok/s son rangos del autor, no garantias.
- No se publican datos sobre sesgos del modelo base ni sobre evaluaciones de seguridad.
- El autor recomienda la edicion V2.1 sobre esta V2 para practicamente todos los usuarios; esta V2 se mantiene por transparencia arquitectonica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2-GGUF
- Edicion recomendada V2.1: https://huggingface.co/IsValorum/KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
