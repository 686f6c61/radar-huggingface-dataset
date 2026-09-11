# Abiray/OUI-1-GGUF

## Resumen

OUI-1-GGUF es el conjunto de cuantizaciones oficiales en formato GGUF del modelo thesysdev/OUI-1, publicado por el usuario Abiray. OUI-1 es un ajuste fino de DiffusionGemma 26B-A4B-it de Google (26 000 millones de parametros totales, 4 000 millones activos) disenado especificamente para generar interfaces de usuario completas en openui-lang, el lenguaje declarativo de UI del proyecto OpenUI. Se presenta como el primer modelo de difusion orientado a Generative UI, y el repositorio GGUF existe para poder ejecutarlo localmente con llama.cpp.

La relevancia de esta ficha esta en dos frentes. Por un lado, el modelo original alcanza un 71,7 % en el Generative UI Benchmark, frente al 13,0 % del modelo base DiffusionGemma, lo que supone un factor de mejora de 5,5x y 132 pantallas resueltas de 184. Por otro, la arquitectura no es autoregresiva: se trata de un modelo de difusion de lenguaje por bloques con un lienzo de 256 tokens, lo que obliga a usar un runner especifico (`llama-diffusion-cli`) implementado en el PR #24423 de llama.cpp.

El repositorio ocupa 114,3 GB e incluye seis cuantizaciones que van de 13,3 GB (Q3_K_M) a 26,9 GB (Q8_0), con la Q4_K_M marcada como recomendada por el autor. La longitud de contexto declarada es de hasta 16 384 tokens, el modelo esta etiquetado unicamente en ingles y la licencia declarada es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion de lenguaje por bloques (diffusion-gemma); lienzo de difusion de 256 tokens, decodificacion iterativa no autoregresiva |
| Parametros totales | 25 250 987 068 (~25,25 B) segun los pesos safetensors del modelo base; la model card indica 26 B |
| Parametros activos | ~4 B (nomenclatura 26B-A4B-it del modelo base) |
| Longitud de contexto | Hasta 16 384 tokens |
| Tipos de cuantizacion | Q3_K_M (13,3 GB), Q4_K_S (15,5 GB), Q4_K_M (16,8 GB), Q5_K_M (19,1 GB), Q6_K (22,7 GB), Q8_0 (26,9 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (ejecutable con llama.cpp) |

## Arquitectura y entrenamiento

OUI-1 deriva de google/diffusiongemma-26B-A4B-it, un modelo de difusion de lenguaje con activacion dispersa (26B totales, 4B activos). A diferencia de un transformer causal clasico, el texto se genera denoising iterativamente sobre un lienzo de difusion por bloques de 256 tokens, con un muestreador limitado por entropia (48 pasos de denoising por defecto y cota de entropia de 0,1). El ajuste fino se realizo mediante LoRA atado (tied LoRA) fusionado en los pesos base, segun indica la model card. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla la configuracion de atencion ni si se emplean mecanismos de atencion lineal.

La innovacion relevante para el despliegue es la integracion en llama.cpp: el PR #24423, atribuido a Daniel Han (Unsloth), implementa grafos de tensores nativos para la arquitectura diffusion-gemma y anade el muestreador de difusion por bloques `llama-diffusion-cli`. El modelo consume plantillas de turno estilo Gemma (`<start_of_turn>system`, `<start_of_turn>user`, `<start_of_turn>model`). El flujo de trabajo previsto no es conversacional: el prompt de sistema aporta las firmas TypeScript y propiedades de la libreria de componentes destino, el prompt de usuario es un brief estructurado en lenguaje natural, y la salida es sintaxis openui-lang con un componente por linea, organizada como arbol jerarquico.

## Capacidades

- Generacion de pantallas de interfaz completas en openui-lang a partir de un brief en lenguaje natural.
- Mapeo de esquemas de componentes TypeScript (nombre, propiedades y tipos) a layouts declarativos validos.
- Emision de arboles jerarquicos de componentes, con un componente por linea, listos para parsear y renderizar.
- Generacion de layouts orientados a datos: paneles de metricas, paginas de estado, tarjetas y bloques de texto con estados de severidad (`good`, `warning`, `error`).
- Integracion con el ecosistema OpenUI: validacion con `@openuidev/lang-core` y renderizado con `@openuidev/react-lang`, `@openuidev/vue-lang` o `@openuidev/svelte-lang`.
- Modo de visualizacion del denoising en terminal mediante el flag `--diffusion-visual` de `llama-diffusion-cli`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Generacion automatica de pantallas desde especificaciones de producto: a partir de un brief que describa secciones y puntos de datos, el modelo emite el arbol completo de componentes en openui-lang, lo que permite pasar de una descripcion funcional a una pantalla renderizable sin escribir JSX a mano.
- Prototipado rapido en equipos de diseno: con la libreria de componentes de la organizacion inyectada como prompt de sistema, se pueden generar variantes de una misma pantalla para explorar alternativas de layout antes de implementarlas.
- Plataformas low-code y text-to-app: el modelo encaja como motor de generacion de UI dentro de herramientas que traducen formularios o asistentes de requisitos en pantallas, ya que su salida es un lenguaje declarativo validable programaticamente.
- Generacion de paneles de monitorizacion y paginas de estado: usando componentes como `Metric` con estado, `Card` y `Stack`, se pueden producir vistas de estado operativo (uptime, incidencias) a partir de un brief con datos concretos, como muestra el ejemplo de la model card.
- Pruebas de regresion visual y generacion de fixtures: la salida declarativa se puede versionar y usar para producir capturas de referencia o datos de prueba en pipelines de CI para librerias de componentes.
- Despliegue local con requisitos de privacidad: al ejecutarse con llama.cpp en GPU de consumo o en equipos con RAM unificada, la generacion de UI puede hacerse sin enviar especificaciones internas de componentes ni datos a servicios externos.
- Sistemas de generacion de interfaces internas a partir de esquemas: dado que el prompt de sistema se genera desde una libreria TypeScript con `npx @openuidev/cli generate`, el modelo puede alimentar generadores de formularios, paneles de administracion y vistas CRUD acopladas a un design system propio.

## Benchmarks y rendimiento

| Modelo | Generative UI Benchmark | Pantallas resueltas (de 184) | Parametros activos |
|---|---|---|---|
| Base DiffusionGemma | 13,0 % | 24 / 184 | 4 B |
| OUI-1 | 71,7 % | 132 / 184 | 4 B |
| Abiray/OUI-1-GGUF | 71,7 % (heredado del modelo original; no se reportan mediciones propias de las cuantizaciones) | 132 / 184 | 4 B |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) para este modelo ni para sus cuantizaciones. Tampoco se reportan mediciones de perplejidad por nivel de cuantizacion mas alla de la indicacion cualitativa de la matriz de cuantizacion.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamano de pesos, sin contar cache KV ni overhead del runtime): Q3_K_M 13,3 GB; Q4_K_S 15,5 GB; Q4_K_M 16,8 GB; Q5_K_M 19,1 GB; Q6_K 22,7 GB; Q8_0 26,9 GB.
- Perfil indicado por el autor: Q3_K_M esta pensada para sistemas con limitacion de memoria y se ejecuta con aproximadamente 16 GB de RAM unificada; Q4_K_M se ajusta con holgura a GPUs de 24 GB de VRAM o a unos 20 GB de RAM de sistema.
- GPU recomendadas: para Q4_K_M y superiores, una RTX 3090 o RTX 4090 de 24 GB permite el offload completo con `-ngl 99`; las cuantizaciones Q6_K y Q8_0 requieren mas de 24 GB y apuntan a A100 40 GB, H100 u otras GPUs de centro de datos.
- Cabe en GPU de consumo: si, al menos las cuantizaciones Q3_K_M, Q4_K_S y Q4_K_M en tarjetas de 16-24 GB; Q3_K_M tambien esta pensada para equipos con RAM unificada de 16 GB.
- Opciones de despliegue: unicamente llama.cpp con el PR #24423 (rama `diffusion-gemma`) y el binario `llama-diffusion-cli`; requiere compilar con `-DGGML_CUDA=ON` para GPU o `-DGGML_NATIVE=ON` para CPU. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros servidores de inferencia.
- Flags relevantes documentados: `-ngl 99` para offload completo a GPU, `-c 4096` para la ventana de contexto en el ejemplo, `-n 512` para el numero de tokens a generar, `-t 16` para hilos de CPU y `--diffusion-visual` para visualizar el denoising del lienzo.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni tiempos de generacion por pantalla; el coste depende del numero de pasos de denoising (48 por defecto) y del tamano del lienzo de 256 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Generative UI Benchmark | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Abiray/OUI-1-GGUF | 25,25 B segun safetensors (26 B declarados) | 16 384 tokens | 71,7 % (heredado) | apache-2.0 | GGUF, 6 cuantizaciones, 114,3 GB de repo |
| thesysdev/OUI-1 | 26 B totales / 4 B activos | 16 384 tokens | 71,7 % (132/184) | no disponible en la informacion proporcionada | Pesos originales del ajuste fino |
| google/diffusiongemma-26B-A4B-it | 26 B totales / 4 B activos | no disponible | 13,0 % (24/184) | no disponible en la informacion proporcionada | Modelo base de Google |

No se dispone de datos de otros modelos generativos de interfaz comparables en la informacion proporcionada, por lo que la comparativa se limita al linaje directo del modelo (base y ajuste fino original). La busqueda web realizada no devolvio resultados tecnicos relevantes.

## Limitaciones y advertencias

- No es un asistente conversacional: la model card indica explicitamente que OUI-1 opera mapeando esquemas de componentes a layouts declarativos, no manteniendo dialogos. Usarlo como chatbot producira resultados fuera de su dominio.
- Modelo unicamente en ingles (etiqueta de idioma `en`); no se declara soporte de castellano ni de otros idiomas.
- Requiere un runner especifico: no funciona con el binario estandar de llama.cpp ni con servidores de inferencia convencionales, ya que la decodificacion es por difusion de bloques y depende del PR #24423, que en el momento de publicacion de la model card es una pull request, no una version estable.
- La salida solo es util si se valida y renderiza con el ecosistema OpenUI (`@openuidev/lang-core` y los renderers correspondientes); fuera de ese pipeline la sintaxis openui-lang debe procesarse con herramientas propias.
- Riesgo de alucinacion de componentes: si el prompt de sistema no declara con precision las firmas y propiedades de la libreria de componentes, el modelo puede emitir componentes o atributos inexistentes. No se han publicado tasas de error medidas.
- La validacion automatica de la salida es imprescindible en produccion, dado que el modelo genera texto de forma iterativa sin garantia de conformidad sintactica.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo ni de seguridad para este modelo o su base.
- La licencia del repositorio es apache-2.0, pero el modelo deriva de pesos de Google (familia Gemma) y del ajuste fino de Thesys; conviene verificar los terminos aplicables del modelo base y del modelo original antes de un uso comercial.
- La fecha de creacion del repositorio indicada en los metadatos (2026-09-11) es posterior a la fecha actual; se reproduce tal cual aparece en la informacion proporcionada.
- No se documentan mecanismos de seguridad, filtrado de contenido ni moderacion en la generacion de interfaces.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Abiray/OUI-1-GGUF
- Modelo original ajustado: https://huggingface.co/thesysdev/OUI-1
- Modelo base (identificador en HuggingFace): google/diffusiongemma-26B-A4B-it
- PR de llama.cpp con soporte de diffusion-gemma: https://github.com/ggml-org/llama.cpp/pull/24423
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Proyecto OpenUI: https://github.com/thesysdev/openui
- Documentacion de openui-lang: https://openui.com/docs
- Benchmarks de Generative UI: https://www.openui.com/benchmarks
- Prompt de referencia del protocolo OpenUI: https://github.com/thesysdev/generative-ui-bench/blob/main/protocols/openui/prompt.ts
- CLI de generacion de prompts de componentes: `npx @openuidev/cli generate`
- Librerias de validacion y renderizado: `@openuidev/lang-core`, `@openuidev/react-lang`, `@openuidev/vue-lang`, `@openuidev/svelte-lang`

No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la busqueda web realizada.
