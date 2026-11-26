# CrashOverrideX/Quillan-Ronin-Mini

## Resumen

Quillan-Ronin-Mini es un modelo de generación de texto publicado por el usuario CrashOverrideX (repositorio GitHub asociado: leeex1/Quillan-Ronin) bajo licencia Apache 2.0. Según la model card, se presenta como el miembro compacto de una "flota" denominada Quillan, construido sobre una arquitectura propia llamada `QuillanRoninSovereign` con pesos ternarios BitNet 1.58b. El autor declara una fusión de cuatro donantes (Qwen 0.6B, Llama ~1B, BitNet 2B-4T y Falcon3 ~1B) a dimensiones compactas, aunque también admite que ese trabajo de fusión está "en progreso" y que los nombres de los donantes son cadenas identificativas, no afirmaciones de escala canónica.

El dato verificable en el repositorio de Hugging Face es un checkpoint de 494.032.768 parámetros en safetensors, con un tamaño de repo de 3,0 GB y un modelo base declarado como Qwen/Qwen2.5-0.5B-Instruct. La model card, sin embargo, afirma 815.396.270 parámetros para el artefacto `quillan-mini-sovereign-bitnet158.safetensors`; existe por tanto una discrepancia entre las cifras del Hub y las de la documentación del autor que conviene tener presente.

El modelo se distribuye principalmente en formato GGUF y está pensado para ejecución local vía Ollama. Su relevancia práctica es limitada: se trata de un experimento de autor independiente, con 250 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y con una model card que mezcla afirmaciones verificadas con otras pendientes de confirmación. Es útil como caso de estudio de cuantización ternaria BitNet a escala sub-1B, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `QuillanRoninSovereign` (arquitectura propia declarada por el autor); pesos ternarios BitNet 1.58b; base declarada Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 (safetensors en el Hub); la model card declara 815.396.270 para el checkpoint `quillan-mini-sovereign-bitnet158.safetensors` |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BitNet 1.58b (ternario: -1, 0, +1); 24 tensores int8 con 24 tensores de escala; GGUF |
| Idiomas soportados | inglés (etiqueta `language: en` en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La model card describe una arquitectura propietaria denominada `QuillanRoninSovereign` con cuantización ternaria BitNet 1.58b, es decir, pesos restringidos a los valores {-1, 0, +1}. El checkpoint verificado contiene 24 tensores int8 acompañados de 24 tensores de escala, y la carga estricta de claves reporta 530/530 sin claves faltantes ni inesperadas. El forward pass produce logits con forma `[1, 8, 151936]`, lo que sitúa el vocabulario en 151.936 tokens, coherente con la familia Qwen2.5.

El autor afirma que el modelo recibe la misma "fusión de grupo de cuatro donantes" que el modelo Flagship, combinando Qwen 0.6B, Llama ~1B, BitNet 2B-4T y Falcon3 ~1B. No obstante, la propia model card matiza que el trabajo de cross-match de contribución por donante está en progreso y que la fracción de donante medida corresponde solo al artefacto existente, no a una fusión completa ya distribuida. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones más allá del modelo base Qwen2.5-0.5B-Instruct.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Pesos ternarios BitNet 1.58b, orientados a inferencia de bajo coste computacional.
- Distribución en GGUF y ejecución vía Ollama (`ollama run crashoverridex/Quillan-Ronin-mini`).
- Ruta de servicio nativa en PyTorch compatible con Ollama (`09 - Projects/mcp/quillan_serve/`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Experimentación con cuantización ternaria BitNet: el modelo sirve para estudiar el comportamiento de pesos {-1, 0, +1} en un transformer de menos de 1B parámetros y comparar la degradación frente a pesos fp16.
- Inferencia local en hardware modesto: con 494 M parámetros y formato GGUF, puede ejecutarse en CPU o en GPUs de gama baja para pruebas de latencia y throughput en entornos sin acelerador dedicado.
- Prototipado de pipelines con Ollama: útil para validar integraciones de la API de Ollama en aplicaciones de chat antes de migrar a modelos mayores.
- Investigación sobre fusión de modelos: dado que el autor documenta una fusión de cuatro donantes, el checkpoint permite analizar cómo se comporta una mezcla declarada a escala compacta.
- Docencia y divulgación: ejemplo práctico de model card con discrepancias entre métricas del Hub y del autor, útil para enseñar a auditar artefactos de Hugging Face.
- Pruebas de compatibilidad de serving: la ruta PyTorch nativa compatible con Ollama permite evaluar la portabilidad entre backends en un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona tablas "Tripartite" y resultados "ARC-AGI-3 en los 99" para el harness cognitivo Quillan (Track A), pero aclara explícitamente que esos números corresponden al harness sobre un modelo base de terceros y no a este modelo. No se ofrecen cifras propias verificables para Quillan-Ronin-Mini.

## Requisitos de hardware

- VRAM estimada: con 494 M parámetros en fp16, aproximadamente 1 GB; en GGUF Q4, en torno a 0,3-0,5 GB. La model card no publica cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- GPU de consumo: sí, cabe en prácticamente cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: Ollama (soporte oficial declarado), llama.cpp para GGUF y PyTorch nativo mediante la ruta de serving del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Quillan-Ronin-Mini | 494 M (Hub) / 815 M (model card) | no disponible | Apache 2.0 | safetensors, GGUF | Pesos ternarios BitNet 1.58b; fusión declarada en progreso |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base declarado; benchmarks públicos disponibles |
| BitNet b1.58 2B-4T | ~2 B | no disponible en esta ficha | MIT (según publicación de Microsoft) | safetensors | Referencia de BitNet 1.58b a mayor escala |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa compacta con licencia restrictiva para algunos usos |

La comparación con Qwen2.5-0.5B-Instruct es la más directa por ser el modelo base declarado: Quillan-Ronin-Mini añade cuantización ternaria pero no publica mejoras medibles. Frente a BitNet b1.58 2B-4T y Llama 3.2 1B, queda por debajo en escala y carece de benchmarks públicos.

## Limitaciones y advertencias

- Discrepancia de parámetros: el Hub reporta 494 M y la model card 815 M para el checkpoint ternario; no está claro qué artefacto corresponde a cada cifra.
- La fusión de cuatro donantes se declara "en progreso"; el propio autor advierte que los nombres de donantes son cadenas identificativas y no afirmaciones de escala.
- Sin benchmarks publicados para este modelo; los números del README raíz corresponden al harness sobre modelos de terceros, no a este checkpoint.
- Idioma limitado al inglés según la etiqueta de la model card; sin datos sobre calidad multilingüe.
- Longitud de contexto no documentada; no apto para tareas que requieran ventanas largas sin verificación previa.
- Riesgo de alucinación elevado por el tamaño reducido (sub-1B) y la falta de datos de ajuste documentados.
- Sesgos: no documentados por el autor; heredables del modelo base Qwen2.5-0.5B-Instruct y de los donantes declarados.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación limita su idoneidad en producción.
- Modelo con 250 descargas y 0 likes: ecosistema mínimo, sin garantías de mantenimiento.
- La model card incluye referencias culturales (periodo Edo, rōnin, bushidō) como marco ético; no implican capacidades adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/CrashOverrideX/Quillan-Ronin-Mini
- Ollama: https://ollama.com/crashoverridex/Quillan-Ronin-mini
- Sitio oficial: https://leeex1.github.io/Quillan-Ronin/
- GitHub: https://github.com/leeex1/Quillan-Ronin
- X (Twitter): https://x.com/Crashoverride_X
- Discord: https://discord.gg/JcFqvWKkRv
- DeepWiki: https://deepwiki.com/leeex1/Quillan-Ronin
- Grokipedia: https://grokipedia.com/page/Quillan-Ronin
- GoFundMe: https://gofund.me/a0667596d
- Modelo base declarado: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
