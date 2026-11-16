# mradermacher/Lanternfall-4B-GGUF

## Resumen

Lanternfall-4B-GGUF es la versión cuantizada en formato GGUF del modelo Lanternfall-4B, desarrollado originalmente por el usuario 1vers1on y cuantizado por mradermacher. Se trata de un modelo de lenguaje orientado a conversación, roleplay y personajes, con etiquetas que indican entrenamiento mediante SFT y DPO sobre una base arquitectónica vinculada a Qwen3.5. El modelo está pensado para mantener interacciones multi-turno con una persona o personaje definido, incluyendo escenarios de sistemas plurales (plural-system), un nicho específico dentro de la comunidad de roleplay.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de nicho con licencia Apache 2.0 y pesos abiertos; por otro, permite evaluar su viabilidad técnica real a partir de los datos disponibles. El dato más llamativo es la discrepancia entre el nombre del modelo ("4B") y el recuento real de parámetros en safetensors (333.514.240, es decir, aproximadamente 333 millones), lo que sugiere que el nombre hace referencia a otra cosa o que el checkpoint publicado no coincide con el esperado. Esta discrepancia debe tenerse en cuenta antes de cualquier despliegue.

El repositorio ocupa 1.0 GB e incluye cuantizaciones estáticas en varios formatos (Q2_K, Q3_K_S/M/L, Q4_K_S/M, Q5_K_S/M, Q6_K, Q8_0, IQ4_XS, x-f16) además de suplementos multimodales mmproj. El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base vinculada a Qwen3.5, según tags; detalles no disponibles) |
| Parametros totales | 333.514.240 (según safetensors); el nombre del modelo indica "4B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a una base Qwen3.5 y a un pipeline de ajuste con SFT (supervised fine-tuning) seguido de DPO (direct preference optimization). El tag "unsloth" sugiere que el entrenamiento se realizó con las herramientas de Unsloth, habituales para fine-tuning eficiente en memoria. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas adicionales de RLHF.

El modelo se presenta como especializado en roleplay, persona, character y plurality/plural-system, lo que indica un ajuste orientado a mantener una voz consistente de personaje y a gestionar interacciones conversacionales sostenidas. No hay información pública sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.) ni sobre la composición exacta del corpus de ajuste. La presencia de suplementos mmproj en el repositorio sugiere capacidades multimodales en el modelo base, aunque no se documenta su alcance.

## Capacidades

- Generación de texto conversacional con foco en roleplay y consistencia de personaje.
- Mantenimiento de persona y voz narrativa a lo largo de interacciones multi-turno.
- Soporte para escenarios de sistemas plurales (plural-system), es decir, múltiples identidades o voces dentro de una misma conversación.
- Ajuste mediante SFT y DPO, lo que en principio favorece respuestas alineadas con preferencias humanas en el dominio conversacional.
- Posible soporte multimodal por la presencia de archivos mmproj (no documentado en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay conversacional en aplicaciones de entretenimiento: el modelo puede mantener una persona definida a lo largo de sesiones largas, gracias al ajuste específico con SFT y DPO sobre datos de personaje.
- Simulación de personajes para juegos de texto o narrativa interactiva: su especialización en "character" permite encarnar voces distintas y sostener diálogos coherentes con el rol asignado.
- Sistemas plurales y comunidades de pluralidad: es uno de los pocos modelos etiquetados explícitamente para "plural-system", lo que lo hace adecuado para aplicaciones que representan múltiples identidades en una misma interfaz conversacional.
- Prototipado rápido en local: al estar disponible en GGUF con cuantizaciones desde Q2_K hasta Q8_0, puede ejecutarse en hardware de consumo para pruebas de concepto sin infraestructura dedicada.
- Chatbots de acompañamiento o journaling con personaje: su orientación conversacional y su licencia Apache 2.0 permiten integrarlo en productos comerciales de nicho sin restricciones de licencia.
- Investigación sobre alineación conversacional: la combinación SFT + DPO documentada en los tags lo convierte en un caso de estudio útil para analizar cómo el ajuste por preferencias afecta la consistencia de persona.
- Evaluación de cuantizaciones: el repositorio ofrece un conjunto amplio de cuantizaciones estáticas, útil para comparar degradación de calidad conversacional entre Q2_K, Q4_K_M, Q8_0, etc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~333 millones de parámetros, las cuantizaciones Q4_K_M rondarían unos 0,3-0,4 GB de pesos; Q8_0 en torno a 0,5-0,6 GB; x-f16 alrededor de 0,7 GB. Los suplementos mmproj añaden 0,5 GB (Q8_0) u 0,8 GB (f16) si se usan capacidades multimodales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. Para despliegue en servidor, A100 o H100 no son necesarias por tamaño, pero pueden usarse para servir muchas instancias concurrentes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; para el modelo base en safetensors, transformers con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lanternfall-4B-GGUF | 333.514.240 (según safetensors) | no disponible | Apache 2.0 | GGUF | Especializado en roleplay, persona y plural-system |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32k (según versión) | Apache 2.0 | safetensors, GGUF | Modelo generalista pequeño, no especializado en roleplay |
| Qwen2.5-3B-Instruct | ~3B | 32k (según versión) | Apache 2.0 | safetensors, GGUF | Generalista, mayor tamaño y capacidades más amplias |
| Llama-3.2-1B-Instruct | ~1,2B | 128k | Llama 3.2 Community License | safetensors, GGUF | Generalista, licencia con restricciones comerciales |

La comparación es orientativa: no hay benchmarks publicados de Lanternfall-4B que permitan contrastar calidad frente a estos modelos. La principal diferencia es su especialización en roleplay/plural-system, frente al carácter generalista de las alternativas.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre ("4B") y el recuento real de parámetros en safetensors (~333M): verificar el checkpoint antes de usarlo en producción.
- Solo idioma inglés declarado; no hay soporte multilingüe documentado.
- No hay información sobre longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Riesgo de alucinación inherente a modelos pequeños y especializados en roleplay: puede generar contenido ficticio con apariencia de factualidad.
- Sesgos potenciales derivados del corpus de roleplay y de los datos de preferencias usados en DPO; no documentados.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base (1vers1on/Lanternfall-4B) y de la arquitectura subyacente (Qwen3.5) por si imponen condiciones adicionales.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Los archivos mmproj sugieren multimodalidad, pero no hay documentación sobre su funcionamiento ni calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lanternfall-4B-GGUF
- Modelo base: https://huggingface.co/1vers1on/Lanternfall-4B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Lanternfall-4B-GGUF
- Repositorio de peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
