# GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_random_fr

## Resumen

`GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_random_fr` es un adaptador LoRA (PEFT) publicado por la organización GRAI-UNSTPB, que corresponde a la Universidad Nacional de Ciencia y Tecnología POLITEHNICA de Bucarest. No se trata de un modelo completo, sino de un ajuste fino sobre `OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO`, un modelo rumano de 8 000 millones de parámetros derivado de Llama 3.1 y alineado previamente con DPO. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador de bajo rango y no con pesos completos.

El identificador del modelo sugiere un ajuste con SFT sobre datos etiquetados como `cs_random_fr`, una convención que en la literatura de procesamiento del lenguaje natural rumano suele asociarse a *code-switching* (alternancia de lenguas) entre rumano y francés. Sin embargo, la model card publicada no documenta el conjunto de datos, el idioma objetivo ni la tarea concreta, por lo que esta interpretación es una hipótesis basada en el nombre y no un dato confirmado por el autor.

La relevancia de esta ficha es limitada pero informativa: el modelo tiene cero descargas y cero *likes*, no declara licencia ni idiomas, y su model card es la plantilla por defecto de HuggingFace sin rellenar. Se incluye aquí como ejemplo de adaptador de investigación no documentado y para advertir de los riesgos de reutilizarlo en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1); este repositorio contiene un adaptador LoRA, no pesos completos |
| Parametros totales | 8 000 millones en el modelo base; el adaptador LoRA ocupa 0,2 GB (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.1 soporta 128 000 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización se aplica al fusionarlo con el modelo base) |
| Idiomas soportados | no disponible (el modelo base está orientado al rumano; el sufijo `fr` del identificador apunta a francés, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Modelo base | OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO |
| Version de PEFT | 0.21.2 |
| Etiquetas | lora, sft, transformers, trl, text-generation, conversational |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura efectiva es la de Llama 3.1 en su variante de 8 000 millones de parámetros: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y codificación posicional RoPE. Sobre esa base, `OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO` aplica un ajuste instruccional y una fase de optimización por preferencias (DPO) orientada al rumano. El repositorio que nos ocupa añade una tercera capa de ajuste mediante LoRA, entrenada con la librería TRL y empaquetada con PEFT.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, los hiperparámetros (rango, alpha, dropout, tasa de aprendizaje) ni la receta de precisión (fp16, bf16 o fp8). La etiqueta `sft` indica aprendizaje supervisado sobre pares instrucción-respuesta, pero se desconoce si hubo una fase posterior de RLHF o DPO en este adaptador concreto. La única referencia técnica externa enlazada en las etiquetas es el artículo de Lacoste et al. (2019) sobre el calculador de impacto de carbono, citado de forma genérica por la plantilla de la model card, no como descripción del entrenamiento.

## Capacidades

- Generación de texto conversacional en formato instrucción, heredada del pipeline `text-generation` y de la naturaleza *chat* del modelo base.
- Ajuste específico sobre datos cuya etiqueta sugiere un escenario de alternancia de lenguas rumano-francés (`cs_random_fr`), sin documentación que lo confirme.
- Capacidad multilingüe potencial derivada de Llama 3.1 y del ajuste rumano del modelo base, no verificada para este adaptador.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (*thinking mode*), visión o audio: no disponible; el modelo base es exclusivamente de texto.
- Al ser un adaptador PEFT, puede combinarse con otros adaptadores o fusionarse con el modelo base para su despliegue.

## Casos de uso

- Investigación académica sobre *code-switching* rumano-francés: el adaptador, si la interpretación del nombre es correcta, serviría para estudiar cómo un modelo alineado en rumano se comporta ante entradas que mezclan ambas lenguas, comparando su salida con la del modelo base sin el adaptador.
- Experimentos de ajuste por preferencias en lenguas de bajos recursos: permite reproducir la cadena Llama 3.1 → DPO rumano → SFT sobre datos mixtos y medir el impacto de cada etapa sobre métricas de fluidez y fidelidad.
- Generación de asistentes conversacionales en rumano para dominio controlado: con 128 000 tokens de contexto heredados del modelo base, podría gestionar conversaciones multi-turno largas, siempre que se valide antes la degradación introducida por el adaptador.
- Comparación de adaptadores LoRA en evaluación controlada: al ser un artefacto pequeño (0,2 GB), es útil como caso de prueba en estudios sobre composición de adaptadores, *merging* y olvido catastrófico.
- Prototipado docente en la UNSTPB: el modelo puede emplearse en prácticas de ajuste fino con PEFT, TRL y transformers sobre un modelo de 8B en una GPU única.
- Traducción o adaptación de estilo rumano-francés en textos técnicos: solo si la validación empírica confirma que el ajuste produce salidas coherentes en esa dirección, algo que la model card no respalda en la actualidad.
- Despliegue en producción: no recomendado en su estado actual por ausencia de licencia, benchmarks y documentación de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con el marcador `[More Information Needed]` en todas sus subsecciones, y no se han encontrado datos en la búsqueda web.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño del modelo base (8 000 millones de parámetros); no están confirmadas por el autor.

- Adaptador LoRA: 0,2 GB en disco, margen despreciable en VRAM una vez cargado.
- Modelo base en fp16/bf16: aproximadamente 16 GB de pesos más overhead de activaciones y caché KV, en torno a 18-22 GB para contextos moderados.
- Modelo base en 8 bits (bitsandbytes): aproximadamente 9-11 GB de VRAM.
- Modelo base en 4 bits (bitsandbytes o GGUF Q4_K_M): aproximadamente 5-7 GB de VRAM.
- GPU consumer: cabe en una RTX 4090 (24 GB) en fp16 y en una RTX 3090 o 4080 (16 GB) con cuantización de 8 bits; una RTX 3060 de 12 GB o una RTX 4070 permiten inferencia en 4 bits con contexto reducido.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB o L40S para fp16 con lotes grandes y contextos largos.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; vLLM y TGI con soporte de adaptadores LoRA (`--enable-lora` y equivalentes) para servicio concurrente; fusión de pesos y conversión a GGUF para llama.cpp, Ollama o LM Studio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de parámetros, contexto y licencia de las alternativas corresponden a la documentación pública de cada modelo base, no a este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_random_fr | 8B (adaptador LoRA) | no disponible; 128k heredados de Llama 3.1 | no disponible | HuggingFace, 0 descargas |
| OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO | 8B | 128k (Llama 3.1) | no disponible en la información consultada | HuggingFace, modelo base de este adaptador |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | HuggingFace, ampliamente desplegado |
| Mistral 7B Instruct v0.3 | 7,3B | 32k | Apache 2.0 | HuggingFace, permisiva para uso comercial |

El adaptador no aporta ventajas medibles frente a sus alternativas en el estado actual de documentación; su único diferencial identificable es el ajuste sobre datos con posible alternancia rumano-francés.

## Limitaciones y advertencias

- Model card sin rellenar: todas las secciones relevantes (sesgos, datos de entrenamiento, usos fuera de alcance, evaluación) contienen el marcador `[More Information Needed]`.
- Licencia no declarada: no puede asumirse permiso de uso comercial. Al derivar de Llama 3.1, se aplican adicionalmente los términos de la Llama 3.1 Community License del modelo base, que conviene verificar.
- Riesgo de alucinación: no evaluado. La ausencia de benchmarks impide cuantificar la fiabilidad factual.
- Sesgos: no documentados. El ajuste sobre un subconjunto pequeño de datos puede acentuar sesgos de dominio o de registro lingüístico.
- Idiomas no declarados: aunque el modelo base está orientado al rumano, no hay garantía de calidad en francés ni en otros idiomas.
- Riesgo de olvido catastrófico: al ser un ajuste LoRA sobre un modelo ya ajustado con DPO, existe riesgo de degradación de las capacidades originales, especialmente si la receta de entrenamiento fue agresiva.
- Cero adopción verificable (0 descargas, 0 *likes*): no hay retroalimentación de la comunidad ni casos de uso validados.
- Fechas de creación y actualización poco habituales (2026): conviene confirmar la procedencia del repositorio antes de integrarlo en cualquier flujo.
- No apto para producción sin evaluación previa de exactitud, toxicidad y comportamiento en los idiomas objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_random_fr
- Modelo base: https://huggingface.co/OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO
- Articulo citado en las etiquetas (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
- Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo. Los unicos resultados obtenidos corresponden a la metodologia GRAI de modelado empresarial, al identificador GS1 Global Returnable Asset Identifier y a documentacion de la Universite de technologie de Compiegne, todos ellos ajenos al modelo descrito.
