# OpenOneRec/Kelix-AEDIT

## Resumen

Kelix-AEDIT es un decodificador de imagenes basado en un transformer de difusion (DiT) derivado de SANA, desarrollado por el equipo OneRec de Kuaishou Technology. Su funcion es reconstruir imagenes a partir de tokens visuales discretos cuantizados, actuando como la etapa de decodificacion de un pipeline de tokenizacion de imagen. A diferencia de Kelix-DiT, que condiciona la generacion sobre los estados ocultos de un LLM, Kelix-AEDIT opera directamente sobre caracteristicas de imagen cuantizadas, lo que le permite reconstruir imagenes sin necesidad de cargar el modelo de lenguaje.

El modelo forma parte de la familia Kelix, una linea de investigacion sobre modelos multimodales unificados que busca cerrar la brecha de comprension que introducen los tokens discretos. Con aproximadamente 1.600 millones de parametros, el repositorio publica unicamente los pesos del DiT; el tokenizador de imagen se reutiliza de Kelix-SFT y el VAE latente (DC-AE) proviene de SANA1.5. La salida por defecto es de 512 x 512 pixeles, con una rejilla de condicionamiento de 18 x 18 y 8 codebooks de 8.192 entradas cada uno.

Su relevancia actual radica en que aborda un problema central de los modelos multimodales unificados: la perdida de fidelidad al pasar por una representacion discreta. Kelix-AEDIT demuestra que es posible reconstruir imagenes de alta calidad desde tokens cuantizados mediante un DiT especializado con flow matching, lo que habilita arquitecturas donde la comprension y la generacion comparten el mismo espacio de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SANA diffusion transformer (DiT) personalizado |
| Parametros totales | 1.606.689.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (rejilla de condicion 18 x 18) |
| Tipos de cuantizacion | no disponible (inferencia en BF16) |
| Idiomas soportados | en |
| Licencia | no disponible (contactar con el equipo OneRec) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kelix-AEDIT es un transformer de difusion basado en la arquitectura SANA, adaptado para decodificar tokens visuales discretos. El condicionamiento se realiza mediante caracteristicas de imagen cuantizadas con fusion de medias, sobre una rejilla por defecto de 18 x 18 que produce 324 tokens, cada uno representado por indices locales en 8 codebooks de 8.192 entradas. El muestreo emplea un solver Euler de 20 pasos con una escala de guia de 4,5 y un flow shift de 3,0. La inferencia se ejecuta en precision BF16 y requiere una GPU NVIDIA CUDA con una build de FlashAttention compatible.

El pipeline completo combina tres componentes cargados por separado: el DiT publicado en este repositorio, el tokenizador de imagen reutilizado de Kelix-SFT y el VAE latente DC-AE procedente de SANA1.5. El modelo no acepta prompts de texto directamente; la generacion texto-a-imagen requiere un modelo autorregresivo compatible que produzca primero los tokens de imagen. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Reconstruccion de imagenes desde tokens visuales discretos cuantizados.
- Decodificacion de tensores de tokens en formato `[324, 8]` para rejillas de 18 x 18.
- Generacion de imagenes de 512 x 512 pixeles a partir de tokens preexistentes.
- Soporte de multiples codebooks (8 codebooks de 8.192 entradas) con indices locales por codebook.
- Compatibilidad con el tokenizador de imagen de Kelix-SFT y el VAE DC-AE de SANA1.5.
- No soporta texto-a-imagen de forma nativa; requiere un modelo autorregresivo externo.
- No dispone de tool calling, function calling ni capacidades de agente.
- Soporte multilingue limitado al ingles en la metadata del repositorio.

## Casos de uso

- Decodificacion en pipelines de modelos multimodales unificados: Kelix-AEDIT actua como la etapa final de generacion de imagen en arquitecturas donde un LLM produce tokens visuales discretos, permitiendo reconstruir la imagen sin cargar el modelo de lenguaje.
- Reconstruccion de imagenes comprimidas: dado un conjunto de tokens cuantizados procedentes de un tokenizador compatible, el modelo recupera la imagen original o una aproximacion fiel, util en sistemas de compresion visual basados en tokens.
- Investigacion en tokenizacion visual discreta: permite evaluar la calidad de distintos tokenizadores y codebooks midiendo la fidelidad de la reconstruccion obtenida por el DiT.
- Generacion condicionada por tokens externos: integrado con un modelo autorregresivo de generacion de tokens, habilita texto-a-imagen en dos etapas (LLM produce tokens, Kelix-AEDIT decodifica).
- Evaluacion de espacios latentes en modelos multimodales: sirve como sonda para medir cuanta informacion visual se conserva tras la cuantizacion discreta.
- Prototipado de interfaces de edicion basada en tokens: al operar sobre representaciones discretas, permite manipular tokens individuales y observar el efecto en la imagen reconstruida.
- Reproduccion de resultados del paper Kelix: el repositorio incluye el script de inferencia y las dependencias necesarias para replicar los experimentos de reconstruccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.600 millones de parametros en BF16, los pesos ocupan aproximadamente 3,2 GB, mas el VAE DC-AE y el tokenizador cargados por separado.
- GPU recomendadas: se requiere una GPU NVIDIA CUDA; el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: probable en GPUs con al menos 8-12 GB de VRAM, aunque no esta confirmado por el autor.
- FlashAttention: requiere una build de FlashAttention compatible con la version de PyTorch y CUDA (se sugiere flash-attn 2.7.4.post1).
- Opciones de despliegue: script de inferencia propio del repositorio Kelix; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kelix-AEDIT | 1.606.689.952 | rejilla 18 x 18 | Decodificacion de tokens visuales | no disponible | Hugging Face |
| Kelix-DiT | no disponible | no disponible | Decodificacion condicionada por LLM | no disponible | Hugging Face |
| SANA1.5 1.6B | 1.600 millones (aprox.) | 1024 px | Texto-a-imagen | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no acepta prompts de texto; requiere tokens visuales generados por un modelo autorregresivo compatible.
- Los tokens deben usar el tokenizador de imagen y los codebooks correspondientes; IDs de vocabulario autorregresivos deben convertirse a indices locales antes de decodificar.
- La licencia no esta definida en el repositorio; el autor indica contactar con el equipo OneRec para la licencia de la serie Kelix. Los componentes base (SANA-DiT, DC-AE, Keye) estan sujetos a sus licencias originales.
- El idioma declarado en la metadata es unicamente ingles.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto mas alla de la rejilla por defecto.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion externa de la comunidad.
- El pipeline de Hugging Face no esta disponible, lo que limita la integracion directa con herramientas estandar.
- Requiere compilacion manual de FlashAttention, lo que puede complicar el despliegue en entornos con versiones de CUDA o PyTorch no compatibles.

## Enlaces

- Hugging Face: https://huggingface.co/OpenOneRec/Kelix-AEDIT
- Paper: https://arxiv.org/abs/2602.09843
- GitHub: https://github.com/Kuaishou-OneRec/Kelix
- Kelix-DiT: https://huggingface.co/OpenOneRec/Kelix-DiT
- Kelix-SFT: https://huggingface.co/OpenOneRec/Kelix-SFT
- VAE DC-AE de SANA1.5: https://huggingface.co/Efficient-Large-Model/SANA1.5_1.6B_1024px_diffusers/tree/main/vae
