# mano99944/glassbox-gpt2-small

## Resumen

Glassbox GPT-2 small es una conversion a 16 bits de los pesos del modelo GPT-2 small de OpenAI, publicada por el usuario mano99944 (proyecto Glassbox). No es un modelo entrenado desde cero ni un fine-tuning con datos nuevos: es una redistribucion de los pesos originales de `openai-community/gpt2` (commit `607a30d783dfa663caf39e06633721c8d4cfcd7e`) redondeados a coma flotante de 16 bits. Su proposito es reducir el tamano de descarga a la mitad (de 548,1 MB a 248,9 MB) para que una aplicacion web pueda cargarlo en el navegador del visitante y ejecutarlo en su propia GPU mediante WebGPU.

El modelo conserva la arquitectura original de GPT-2 small: un transformer decoder-only de 124,4 millones de parametros con contexto de 1024 tokens. La unica transformacion aplicada es el redondeo de cada peso al float16 mas cercano y la omision de las mascaras de atencion, que pueden reconstruirse. Los nombres de los tensores no cambian, por lo que es compatible con el cargador estandar de GPT-2.

Su relevancia es acotada pero concreta: sirve como artefacto de despliegue para inferencia local en navegador con WebGPU, con una perdida de calidad medida y documentada por el autor. No aporta capacidades nuevas respecto al GPT-2 original y hereda todas sus limitaciones de conocimiento y generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), pesos en float16 |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2) |
| Tipos de cuantizacion | float16 (los pesos del repo); no se publican variantes GGUF ni int8 |
| Idiomas soportados | no disponible (el autor no declara lista; GPT-2 se entreno principalmente en ingles) |
| Licencia | MIT (Modified MIT License de OpenAI, incluida como `LICENSE`) |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 small: 12 capas de transformer decoder-only con atencion multi-cabeza, embedding de 768 dimensiones y 124,4 millones de parametros. El modelo no se ha entrenado ni ajustado en esta publicacion; se parte del checkpoint oficial de OpenAI y se aplica exclusivamente una conversion de precision: cada peso se redondea al float16 mas cercano y se eliminan las mascaras de atencion por ser reconstruibles. Los nombres de los tensores se mantienen identicos a los del modelo original.

El autor documenta la fidelidad de la conversion con dos medidas. Primero, sobre 173 posiciones de palabra en 14 prompts, el modelo predice la misma palabra mas probable en todos los casos y la probabilidad de esa palabra varia como maximo 0,52 puntos porcentuales. Segundo, sobre 600 prompts de nombres procedentes de "Interpretability in the Wild", acierta en 600 de 600 y la ventaja media del nombre correcto es 3,5883 frente a 3,5882 del original. No se documenta ningun proceso de RLHF, DPO ni entrenamiento adicional.

## Capacidades

- Generacion de texto autoregresiva en ingles, con la calidad del GPT-2 small original.
- Prediccion de siguiente token y completado de prompts cortos.
- Tareas basicas de comprension de texto y respuesta a preguntas simples dentro de su ventana de contexto.
- Deteccion de nombres y entidades en frases (validada por el autor con el conjunto de "Interpretability in the Wild").
- Ejecucion en navegador mediante WebGPU, con inferencia local en la GPU del visitante.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento extendido ni capacidades de agente multi-paso.
- No dispone de vision ni audio.
- Capacidad multilingue no declarada; el modelo base esta dominado por el ingles.

## Casos de uso

- Demostraciones de inferencia en navegador: el modelo se carga desde el repositorio en una aplicacion WebGPU y genera texto en la GPU del usuario sin enviar datos a un servidor, gracias a su tamano de 248,9 MB.
- Prototipos de interpretabilidad: al mantener los nombres de tensores y el comportamiento del GPT-2 original, sirve para reproducir analisis de neuronas y circuitos (por ejemplo, los experimentos de nombres de "Interpretability in the Wild") en entornos con menos memoria.
- Educacion y docencia: permite mostrar el funcionamiento interno de un transformer pequeno en un cuaderno o en el navegador con una descarga reducida.
- Pruebas de integracion de pipelines: util como modelo de sustitucion barato para validar codigo de tokenizacion, generacion y evaluacion antes de pasar a modelos mayores.
- Generacion de texto offline en dispositivos con poca VRAM: al ocupar aproximadamente 250 MB en float16, cabe en GPUs integradas y en portatiles modestos.
- Evaluacion comparativa de precision: sirve para medir el impacto del redondeo a float16 frente al checkpoint original en tareas de prediccion de siguiente token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta las dos medidas de fidelidad frente al modelo original descritas en la seccion de arquitectura: coincidencia del 100 % en la palabra mas probable sobre 173 posiciones en 14 prompts (variacion maxima de 0,52 puntos porcentuales) y 600 aciertos sobre 600 en los prompts de nombres de "Interpretability in the Wild", con ventaja media de 3,5883 frente a 3,5882.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 250 MB para los pesos en float16, mas el espacio de activaciones y cache KV, que depende de la longitud de contexto.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el caso de navegador; en servidor, GPUs de gama baja como T4 o incluso integradas son suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en graficas integradas, dado el tamano del modelo.
- Opciones de despliegue: aplicacion web con WebGPU (caso previsto por el autor); en servidor puede cargarse con bibliotecas compatibles con safetensors y GPT-2, aunque el autor no documenta configuraciones de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Glassbox GPT-2 small | 124,4 M | 1024 | safetensors float16 | MIT (Modified MIT de OpenAI) | Conversion a float16 del GPT-2 small para WebGPU |
| openai-community/gpt2 | 124,4 M | 1024 | safetensors float32 | Modified MIT de OpenAI | Modelo original; 548,1 MB frente a 248,9 MB |
| DistilGPT-2 | no disponible en la informacion | no disponible | no disponible | no disponible | Alternativa destilada de GPT-2; datos no verificados en esta ficha |

## Limitaciones y advertencias

- Conocimiento limitado al corpus de entrenamiento de GPT-2 (anterior a 2019); no conoce hechos posteriores.
- Riesgo alto de alucinacion en preguntas factuales y en generacion larga, inherente al GPT-2 small.
- Ventana de contexto de solo 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas: el autor no declara lista de idiomas; el modelo base esta entrenado predominantemente en ingles y su rendimiento en castellano es limitado.
- Sesgos: al no documentarse evaluaciones de sesgo en esta publicacion, se heredan los sesgos del GPT-2 original, que no estan cuantificados aqui.
- Licencia: se distribuye bajo la Modified MIT License de OpenAI incluida como `LICENSE`; conviene revisar sus terminos antes de uso comercial.
- El redondeo a float16 introduce una variacion pequena pero no nula en las probabilidades de salida (hasta 0,52 puntos porcentuales en las pruebas del autor).
- El repositorio no declara pipeline ni idiomas en Hugging Face, y no tiene descargas ni likes, por lo que carece de validacion externa.
- No se publican variantes cuantizadas adicionales ni instrucciones de despliegue en servidor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mano99944/glassbox-gpt2-small
- Modelo base: https://huggingface.co/openai-community/gpt2
- Commit del modelo base: `607a30d783dfa663caf39e06633721c8d4cfcd7e`
- Paper de referencia citado por el autor ("Interpretability in the Wild"): no disponible en la informacion proporcionada
- Repositorio o demo de la aplicacion Glassbox: no disponible en la informacion proporcionada
