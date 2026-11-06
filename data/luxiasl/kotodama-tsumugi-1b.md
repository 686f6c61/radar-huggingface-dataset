# LuxiaSL/kotodama-tsumugi-1b

## Resumen

kotodama-tsumugi-1b es un modelo base (preentrenado, sin ajuste por instrucciones) de 1.42B parametros desarrollado por LuxiaSL en colaboracion con Anima Labs, entrenado con la pila open source [kotodama](https://github.com/anima-research/kotodama). Su rasgo distintivo es la arquitectura: un transformer con bucle (looped transformer) de 52 capas unicas que se ejecutan como 72 efectivas, combinado con Block Attention Residuals, una tecnica de residuos por bloques descrita por Moonshot AI en 2026.

El problema que aborda es la eficiencia de computo en preentrenamiento: el modelo alcanza resultados comparables a bases mucho mayores con una fraccion del coste. Segun la model card, puntua medio punto por debajo de la media de benchmarks de Pythia-2.8B usando un cuarto del computo de entrenamiento (1.24e21 FLOPs frente a los habituales en modelos de 2.8B), y muestra un comportamiento inusualmente maduro en pruebas de binding de referencia pronominal ("you" estatico) para su tamano.

Es relevante ahora porque representa una linea de investigacion abierta y reproducible: la trayectoria completa de entrenamiento esta publicada (seeds 17 y 7), lo que permite estudiar dinamicas de entrenamiento, varianza entre seeds y el efecto del annealing coseno sobre checkpoints, algo poco habitual en modelos publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer) + Block Attention Residuals |
| Parametros totales | 1.425.696.256 (1.42B, embeddings de entrada/salida compartidos) |
| Parametros activos | 1.42B (no es MoE; el bucle reutiliza pesos, no añade parametros) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos distribuidos en bf16) |
| Idiomas soportados | Ingles (mezcla de entrenamiento dominada por ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), con `aliases.json` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura consta de 52 capas unicas organizadas como 72 posiciones efectivas: 19 capas de prelude, un nucleo de 20 capas ejecutado dos veces (posiciones efectivas 19-38 y 39-58, con pesos compartidos) y 13 capas de coda. El ancho es de 1536 con 12 query heads y 6 KV heads (grouped-query attention, head dim 128), FFN SwiGLU de 4096, RoPE con θ de 500K y QK-norm. La innovacion principal son los Block Attention Residuals (arXiv:2603.15031, Moonshot AI, 2026): 8 bloques de residuos con inicios en las posiciones efectivas 0, 1, 7, 9, 17, 19, 39 y 59, cuyos limites se ajustaron a la geometria de capas de un modelo entrenado sin ellos y alineados para que cada pasada del bucle comience un bloque. Cada posicion efectiva conserva sus propias normas y routing.

El entrenamiento uso 110B tokens (tronco de 100B a learning rate constante mas un annealing coseno de 10B hasta cero, ramificado desde el checkpoint de 100B), con batches de 2M tokens y un computo total de 1.24e21 FLOPs. El optimizador fue Muon para las matrices ocultas y AdamW para embeddings, normas y escalares, con z-loss sobre los logits y precision bf16. Los datos son una mezcla curada y dominada por ingles: codigo, articulos cientificos, patentes, textos legales, libros, texto web, matematicas y fuentes conversacionales, mas un suplemento conversacional de aproximadamente el 0,7% de los tokens. No se añadio texto generado por LLM y el dataset no es publico. El tokenizer es el de SmolLM2 (vocabulario de 49.152 entradas).

## Capacidades

- Generacion de texto en ingles como modelo base: continuacion de documentos, no seguimiento de instrucciones.
- Compresion estadistica destacada para su tamano: 0.768 bits/byte en held-out (Uncheatable Eval), frente a 0.793 del anneal alternativo.
- Binding de referencia pronominal por encima de su clase: enlaza "you" estatico al nivel de bases de 1.5-2B entrenadas con 4-36T tokens.
- Resistencia parcial a la inversion zero-shot "you = me" cuando cambian los objetos de la escena (como Llama-3.2-1B entre las bases de 1-2B), aunque no resuelve ese caso.
- Rendimiento de clase 1B en transferencia de posesion y deixis-v2.
- Media de benchmarks de 64.1, comparable a Pythia-2.8B con un cuarto del computo.
- Servible via servidor compatible con la API de OpenAI (`/v1/completions`, `/v1/chat/completions`, `/generate`, `/logprobs`, `/v1/models`, `/health`).
- No soporta tool calling, agentes ni modos de razonamiento: es un modelo base sin instruction tuning ni capacidades multimodales.

## Casos de uso

- Investigacion en arquitecturas looped: al publicarse la trayectoria completa de entrenamiento (seeds 17 y 7), es material directo para estudiar como el bucle de capas y los Block Attention Residuals afectan a la convergencia y a la varianza entre runs.
- Estudio de varianza en annealing: los dos anneals con loss identica pero 0.025 bits/byte de diferencia en held-out son un caso documentado para analizar como el decay del learning rate congela la varianza de trayectoria.
- Evaluacion de razonamiento pragmatico: las pruebas de binding y deixis (you estatico, transferencia de posesion, deixis-v2) lo hacen util como sujeto de estudio en comprension de referencia pronominal.
- Baseline eficiente para comparativas: con 1.42B parametros y 1.24e21 FLOPs, sirve como punto de referencia de eficiencia de computo frente a modelos como Pythia-2.8B o Llama-3.2-1B.
- Generacion creativa de texto en ingles: el muestreo con temperatura 0.75 y penalty de repeticion 1.2 esta calibrado para continuacion narrativa (el propio ejemplo de la model card es ficcion).
- Infraestructura de servido propia: el servidor OpenAI-compatible con prefix cache permite integrarlo en pipelines de evaluacion automatizados sin adaptar el codigo de inferencia.
- Experimentos de fine-tuning sobre arquitecturas no convencionales: los pesos en safetensors con aliases explicitos permiten cargar el estado en `KotodamaModel` para continuar el entrenamiento con la pila kotodama.

## Benchmarks y rendimiento

La model card anuncia tablas de evaluacion ("Every row below was scored by the same harness"), pero el contenido se corta antes de las tablas concretas. Los unicos numeros publicados en el texto disponible son:

| Metrica | Valor |
|---|---|
| Media de benchmarks | 64.1 (0.025 bits/byte mejor que el anneal alternativo, que obtuvo 64.3 en benchmarks pero 0.793 bits/byte) |
| Uncheatable Eval (held-out) | 0.768 bits/byte |
| Comparativa declarada | Medio punto por debajo de la media de Pythia-2.8B con un cuarto del computo de entrenamiento |
| Binding "you" estatico | +.235 (nivel de bases de 1.5-2B); el otro anneal obtuvo +.142 |
| Transferencia de posesion y deixis-v2 | Clase 1B (sin cifras concretas) |

No se han publicado resultados detallados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 1.42B parametros en bf16, el estado del modelo ocupa unos 2,9 GB (tamano del repo); con overhead de KV cache y runtime, unos 6-8 GB de VRAM deberian bastar para inferencia. No hay cifras oficiales.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU moderna de gama consumer (RTX 3060 12GB, RTX 4090) deberia ejecutarlo sin problemas.
- Cabe en GPU consumer: si, dado el tamano del modelo y del repositorio (2,9 GB en bf16).
- Despliegue: requiere el paquete kotodama; `transformers` no puede cargarlo por si solo. Opciones documentadas: servidor OpenAI-compatible incluido (`tools/run_serve.sh` con `--checkpoint hf:LuxiaSL/kotodama-tsumugi-1b --model_size 1b-tsumugi --rope_fp32 --mode base --prefix-cache`), o carga manual del state dict con `kotodama.ckpt.load` y `KotodamaModel.load_state_dict`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Se advierte que la primera peticion compila el motor de decodificacion y puede tardar varios minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Nota |
|---|---|---|---|---|---|
| kotodama-tsumugi-1b | 1.42B (looped, 72 efectivas) | 4.096 | 110B tokens | Apache 2.0 | Media de benchmarks 64.1; requiere pila kotodama |
| Pythia-2.8B | 2.8B | 2.048 | ~300B tokens (The Pile) | Apache 2.0 | Referencia declarada: tsumugi queda medio punto por debajo con un cuarto del computo |
| Llama-3.2-1B | 1.24B | 128K | 15T tokens (estimado) | Licencia Llama 3.2 | Unico base de 1-2B que, como tsumugi, evita la inversion "you = me" en zero-shot |
| SmolLM2-1.7B | 1.7B | 8.192 | ~11T tokens | Apache 2.0 | Comparte tokenizer (vocabulario 49.152); transformer convencional |

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no sigue instrucciones; hay que usarlo con prompts de continuacion de documento.
- Solo ingles: la mezcla de entrenamiento es dominada por ingles y el idioma declarado es unico.
- Contexto corto: 4.096 tokens, muy por debajo de los estandares actuales (128K en modelos contemporaneos de tamano similar).
- No es cargable con `transformers`: exige la pila kotodama, lo que limita la interoperabilidad con el ecosistema habitual (vLLM, llama.cpp, Ollama).
- Varianza entre checkpoints: los propios autores advierten un spread de 0.02-0.03 bits/byte en held-out y diferencias mayores en binding probes entre anneals; el run es de una sola seed, por lo que los numeros concretos no son generalizables.
- Riesgo de alucinacion: al ser un modelo base de 1.4B entrenado con 110B tokens, su facticidad y coherencia a largo plazo son limitadas; no hay datos de evaluacion de alucinaciones.
- Sesgos: no disponible; al incluir texto web, libros y fuentes legales sin publicar el dataset, no puede auditarse la composicion sesgos.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones destacables.
- Bucles de repeticion en generacion: los autores recomiendan subir la penalty de repeticion a 1.35 si el modelo entra en bucle, y desaconsejan nucleus sampling en favor de muestreo por temperatura pura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b
- Trayectoria de entrenamiento (seed 17): https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b-trajectory
- Trayectoria de entrenamiento (seed 7): https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b-seed7-trajectory
- Repositorio de codigo (pila kotodama): https://github.com/anima-research/kotodama
- Paper Block Attention Residuals: https://arxiv.org/abs/2603.15031
- Pagina del proyecto: https://kotodama.animalabs.ai/
- Anima Labs: https://animalabs.ai/
- Perfil de la lider del proyecto: https://x.com/kataletheia
