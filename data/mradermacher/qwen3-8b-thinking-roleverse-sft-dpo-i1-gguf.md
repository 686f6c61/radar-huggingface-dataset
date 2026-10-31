# mradermacher/Qwen3-8B-Thinking-RoleVerse-SFT-DPO-i1-GGUF

## Resumen

Qwen3-8B-Thinking-RoleVerse-SFT-DPO-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo tinyrolls/Qwen3-8B-Thinking-RoleVerse-SFT-DPO, realizadas por mradermacher, un cuantizador muy activo de la comunidad de Hugging Face. El modelo base es un fine-tuning de Qwen3-8B (modelo de lenguaje de 8 mil millones de parametros de Alibaba) especializado en role-playing y dialogo, entrenado mediante SFT (supervised fine-tuning) seguido de DPO (Direct Preference Optimization) sobre el dataset tinyrolls/RoleVerse.

La relevancia de esta version cuantizada radica en que permite ejecutar el modelo en hardware de consumo: las cuantizaciones van desde aproximadamente 2,2 GB (IQ1_S) hasta 6,0 GB (Q5_K_M), lo que hace viable su uso en GPUs gaming y en CPUs con suficiente RAM. El modelo conserva la herencia de Qwen3, incluyendo el "thinking mode" (razonamiento explicito antes de responder) y soporte multilingue.

Es un modelo orientado a casos de uso conversacionales, especialmente role-playing de personaje, con soporte para cinco idiomas: ingles, chino, japones, frances y castellano. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE; asumo densidad completa) |
| Longitud de contexto | no disponible (Qwen3-8B base soporta 32.768 tokens nativos, 131.072 con YaRN, pero no consta en la ficha) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M (y Q6_K segun metadatos) |
| Idiomas soportados | ingles, chino, japones, frances, castellano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base hereda la arquitectura de Qwen3-8B, un transformer decoder denso (no MoE) de la familia Qwen3 de Alibaba. La variante "Thinking" indica que el modelo conserva el modo de razonamiento de Qwen3, en el que genera un bloque de pensamiento interno antes de producir la respuesta final, algo que en role-playing puede traducirse en mayor coherencia narrativa y de personaje.

El ajuste fino se realizo en dos etapas sobre el dataset tinyrolls/RoleVerse: primero un SFT (supervised fine-tuning) para adaptar el modelo a conversaciones de role-playing y dialogo, y despues DPO (Direct Preference Optimization) para alinear las respuestas con preferencias humanas en ese dominio, mejorando tipicamente la calidad estilistica y la adherencia al personaje. No se ha publicado informacion sobre el numero de tokens de entrenamiento ni la composicion detallada del dataset.

Esta ficha corresponde a las cuantizaciones GGUF con imatrix de mradermacher, que usan una matriz de importancia calculada sobre datos de calibracion para reducir la perdida de calidad en cuantizaciones agresivas (especialmente en rangos IQ1-IQ3). Se ofrecen tanto quants "weighted/imatrix" (este repo) como static quants en un repo hermano.

## Capacidades

- Generacion de texto conversacional con especializacion en role-playing de personaje y dialogos inmersivos multi-turno.
- Modo de razonamiento (thinking mode) heredado de Qwen3: el modelo puede generar razonamiento explicito antes de responder.
- Soporte multilingue en cinco idiomas: ingles, chino, japones, frances y castellano.
- Capacidades generales heredadas de Qwen3-8B: razonamiento general, matematicas y codigo a nivel del modelo base, aunque el fine-tuning esta orientado a dialogo y puede degradar el rendimiento en tareas de instruccion general.
- No se ha documentado soporte de tool calling / function calling para esta variante fine-tuned (no disponible en la informacion proporcionada).
- No se ha documentado soporte de agentes ni multi-step reasoning explicito (no disponible).
- No incluye capacidades multimodales: es un modelo de texto.

## Casos de uso

- Role-playing interactivo de personajes: el modelo esta afinado especificamente con el dataset RoleVerse para mantener personalidades coherentes en conversaciones largas, siendo su caso de uso principal.
- Chatbots narrativos y ficcion interactiva: puede generar dialogos y descripciones de escena en juegos de texto o aventuras conversacionales, con el thinking mode aportando coherencia narrativa.
- Companeros conversacionales en local: gracias a las cuantizaciones de 2-6 GB, puede ejecutarse sin conexion en un portatil o PC de consumo, util para aplicaciones de compania con privacidad total.
- Asistente de escritura creativa: puede ayudar a novelistas o guionistas a explorar dialogos entre personajes y probar escenas desde la perspectiva de cada personaje.
- Practica de idiomas conversacional: al soportar castellano, frances, japones, chino e ingles, puede simular conversaciones con personajes en distintos idiomas.
- Prototipado de agentes conversacionales: al ser ligero y ejecutable con llama.cpp u Ollama, es adecuado para desarrollar y probar bots de dialogo antes de escalar a modelos mayores.
- Generacion de contenido para comunidades de rol online: automatizacion de NPCs con personalidad en servidores de juego o foros de rol por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3-8B cuenta con resultados publicados por Alibaba, pero no constan datos especificos de esta variante fine-tuned ni de las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - IQ1_S/IQ1_M: ~2,2-2,4 GB (calidad muy degradada, solo para pruebas).
  - IQ3_M / Q4_K_S: ~4,0-4,9 GB.
  - Q4_K_M (recomendado): ~5,1 GB.
  - Q5_K_M: ~6,0 GB.
- GPUs recomendadas: cualquier GPU con 6 GB o mas de VRAM ejecuta comodo Q4_K_M/Q5_K_M; por ejemplo RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 (con contexto muy amplio). En la gama profesional, cualquier GPU moderna funciona sin problema dado el tamano reducido.
- Consumer GPUs: si, es uno de los puntos fuertes de esta ficha; con Q4_K_M (5,1 GB) cabe en GPUs de 8 GB con margen para el contexto, e incluso en GPUs de 6 GB con cuants IQ3/IQ4.
- CPU: las cuantizaciones mas pequenas (IQ2/IQ3) son viables en CPU pura con 8-16 GB de RAM a velocidades de unos pocos tokens por segundo.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp (muy usado para role-playing), text-generation-webui. No es un GGUF orientado a vLLM/TGI (que requieren pesos safetensors; para eso usaria el modelo base).
- Latencia y throughput: no disponibles; en GPUs de consumo con Q4_K_M cabe esperar decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Formato | Licencia |
|---|---|---|---|---|
| Qwen3-8B-Thinking-RoleVerse-SFT-DPO (este) | 8,19 B | Role-playing y dialogo (SFT + DPO) | GGUF imatrix | Apache 2.0 |
| Qwen3-8B (base) | 8,19 B | General, thinking mode | Safetensors y GGUF | Apache 2.0 |
| Llama-3.1-8B-Instruct | 8 B | General, instruccion | Safetensors y GGUF | Llama 3.1 Community License |
| Mistral-7B-Instruct v0.3 | 7,2 B | General, instruccion | Safetensors y GGUF | Apache 2.0 |

Frente a los modelos generales de su clase (Llama-3.1-8B, Mistral-7B), este modelo ofrece un comportamiento afinado especificamente para role-playing, con DPO sobre datos del dominio, manteniendo el multilingue y una licencia permisiva. Su desventaja es la falta de benchmarks publicos y el posible retroceso en tareas generales de instruccion respecto al modelo base.

## Limitaciones y advertencias

- Al ser un fine-tuning orientado a role-playing, el rendimiento en tareas generales (codigo, matematicas, razonamiento riguroso) puede haberse degradado respecto a Qwen3-8B original; no hay benchmarks que lo cuantifiquen.
- Riesgo de alucinacion inherente a los LLM; en role-playing, el modelo puede mezclar hechos reales con la ficcion del personaje.
- Los cuants de muy baja bit-rate (IQ1_S, IQ1_M, IQ2_XXS) sufren perdidas de calidad significativas, como advierte el propio mradermacher ("for the desperate"); para produccion se recomienda Q4_K_M o superior.
- El thinking mode genera tokens de razonamiento adicionales que aumentan la latencia y el consumo de contexto; puede convenir desactivarlo en dialogos rapidos si el formato de plantilla lo permite.
- Sin datos de contexto confirmados para esta variante; si se necesita contexto largo, verificar la plantilla de chat y los parametros de llama.cpp.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque el dataset RoleVerse y el contenido generado para role-playing pueden plantear consideraciones de moderacion de contenido.
- El pipeline del modelo figura como "no disponible" en Hugging Face; no hay model card detallada del autor del fine-tuning en la informacion proporcionada.

## Enlaces

- Repositorio de las cuantizaciones (esta ficha): https://huggingface.co/mradermacher/Qwen3-8B-Thinking-RoleVerse-SFT-DPO-i1-GGUF
- Modelo base (fine-tuning SFT+DPO): https://huggingface.co/tinyrolls/Qwen3-8B-Thinking-RoleVerse-SFT-DPO
- Cuants estaticos del mismo modelo: https://huggingface.co/mradermacher/Qwen3-8B-Thinking-RoleVerse-SFT-DPO-GGUF
- Pagina de descargas resumida de mradermacher: https://hf.tst.eu/model#Qwen3-8B-Thinking-RoleVerse-SFT-DPO-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Guia de uso de GGUF referenciada: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
