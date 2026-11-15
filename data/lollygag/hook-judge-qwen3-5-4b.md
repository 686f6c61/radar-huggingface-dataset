# lollygag/hook-judge-qwen3.5-4b

## Resumen

Hook judge es un adaptador LoRA sobre Qwen3.5-4B disenado como juez pairwise de ganchos (hooks) de video corto. Dado un par de pies de foto de TikTok procedentes de la misma busqueda y de creadores de tamano similar, el modelo decide cual de los dos videos obtuvo muchas mas visualizaciones en relacion con el numero de seguidores de su creador. No genera ganchos: los clasifica. El autor es el usuario de Hugging Face `lollygag` y el modelo se entreno con LoRA (r 16, alpha 32, sobre todas las proyecciones de atencion y MLP) usando la herramienta AutoScientist de Adaption.

El modelo resuelve un problema muy concreto de los equipos de contenido en video corto: priorizar entre varios borradores de gancho antes de publicar. En lugar de depender de intuicion o de un LLM generico, ofrece una senal calibrada especificamente para la relacion entre gancho y rendimiento relativo al tamano de la audiencia.

Es relevante porque demuestra que un ajuste fino pequeno y barato (adaptador de 0,1 GB) puede superar a un modelo frontera en zero-shot en una tarea de dominio estrecho: 62,7 % de acierto frente al 51,2 % de Claude Haiku 5.5 y el 49,3 % del Qwen3.5-4B sin ajustar. La arquitectura subyacente es la de Qwen3.5-4B, con capas de atencion lineal y ventana de contexto no especificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3.5-4B; rango 16, alpha 32, todas las proyecciones de atencion y MLP |
| Parametros totales | Adaptador LoRA sobre un modelo base de 4B (parametros del adaptador no disponibles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles; los datos de entrenamiento son mayoritariamente en ingles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer con capas de atencion lineal (el autor menciona que sin `flash-linear-attention` y `causal-conv1d` esas capas caen a PyTorch puro). El ajuste es un LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atencion y MLP, entrenado con AutoScientist de Adaption. El pipeline declarado es `text-generation`, aunque la tarea efectiva es clasificacion binaria pairwise leida como probabilidad del siguiente token ("A" o "B").

Los datos de entrenamiento son aproximadamente 3.700 pares de pies de foto (unas 7.400 filas contando ambos ordenes) extraidos de resultados publicos de busqueda de TikTok en multiples nichos. Cada par cumple: misma busqueda, seguidores de los creadores dentro de un factor 3x y una diferencia de al menos 5x en visualizaciones por seguidor. Se excluyen publicaciones pagadas y se limita la antiguedad de los videos entre 14 dias y 18 meses. Los ganadores se balancean para que el creador mas pequeno gane exactamente la mitad de las veces. No se publica el dataset. La innovacion principal es metodologica: el prompt no contiene cifras de seguidores ni de visualizaciones, de modo que el modelo aprende la senal del texto del gancho, no a hacer aritmetica con metadatos.

## Capacidades

- Clasificacion pairwise de ganchos: devuelve "A" o "B" indicando que pie de foto rindio mas en visualizaciones por seguidor.
- Lectura de probabilidades calibradas: el uso previsto es leer la probabilidad del siguiente token para "A" y "B", no generar texto libre.
- Correccion de sesgo posicional: el autor recomienda consultar en ambos ordenes y promediar.
- Dominio especifico de video corto en TikTok, con vocabulario y patrones de gancho de esa plataforma.
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso; es un clasificador de una sola consulta.
- Capacidades multilingues no evaluadas; el entrenamiento es mayoritariamente en ingles.

## Casos de uso

- Priorizacion de borradores de gancho: un equipo de contenido escribe cinco pies de foto para un video y el modelo los enfrenta por pares para ordenarlos por probabilidad de rendimiento relativo.
- Filtrado previo a publicacion: en un calendario editorial con decenas de videos semanales, se descartan los ganchos con menor probabilidad antes de la revision humana.
- Analisis competitivo: dado un conjunto de pies de foto de la misma busqueda en TikTok, se identifica que patrones textuales correlacionan con mejor rendimiento por seguidor.
- Investigacion de mercado por nicho: al haberse entrenado con 51 nichos no vistos en la evaluacion, sirve para explorar que tipo de gancho funciona en categorias nuevas.
- Senal de entrenamiento para generadores: las probabilidades del juez pueden usarse como recompensa o filtro para seleccionar ejemplos en un pipeline de generacion de ganchos.
- Auditoria de creatividades: comparar variantes de un mismo gancho (A/B testing textual) antes de invertir en produccion o en promocion pagada.
- Docencia y formacion de creadores: mostrar de forma cuantitativa por que un gancho concreto supera a otro en el mismo contexto de busqueda.

## Benchmarks y rendimiento

Evaluacion sobre 1.386 pares reservados de 51 nichos no vistos en entrenamiento (disjuntos por nicho, autor y video). Cada par se consulta en ambos ordenes; se considera acierto si ambas ordenes coinciden en el ganador, fallo si ambas coinciden en el perdedor y 0,5 si discrepan.

| Modelo | Precision |
|---|---|
| Este adaptador | 62,7 % (IC 95 %: 60,5-65,0, bootstrap agrupado por nicho) |
| TF-IDF + regresion logistica sobre palabras del pie de foto | 59,9 % |
| Claude Haiku 5.5, zero-shot | 51,2 % |
| Qwen3.5-4B sin ajustar | 49,3 % (responde "A" el 90 % de las veces) |

Frente a Haiku: +11,4 puntos, test de signos p < 0,0001. Frente al base sin ajustar: +13,3 puntos, p < 0,0001. Frente al modelo de palabras: +2,8 puntos, no significativo (p = 0,44).

## Requisitos de hardware

- El adaptador pesa 0,1 GB; el coste real esta en el modelo base Qwen3.5-4B.
- VRAM estimada para el base en fp16: aproximadamente 8-9 GB solo para pesos, mas cache KV y activaciones; en la practica conviene una GPU de 16 GB o mas.
- GPU recomendadas: A100, H100 o L40S para lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso individual.
- Cabe en GPU de consumo con 16 GB o mas en fp16; con cuantizacion a 8 o 4 bits cabria en 8-12 GB, aunque el autor no documenta cuantizaciones probadas.
- Despliegue: transformers + peft (uso documentado por el autor). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador de clasificacion con lectura de logits, la integracion mas directa es un servidor propio con transformers.
- Latencia: en una Colab T4 gratuita el autor reporta unos 6 minutos para 2.772 prompts (aproximadamente 130 ms por prompt), lastrado por la ausencia de `flash-linear-attention` y `causal-conv1d`. Con esos kernels instalados y GPU moderna el rendimiento deberia mejorar, aunque no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hook judge (este adaptador) | Base 4B + LoRA | No disponible | 62,7 % | No disponible | Hugging Face, 0 descargas |
| Qwen3.5-4B sin ajustar | 4B | No disponible | 49,3 % | No disponible | Hugging Face |
| Claude Haiku 5.5 (zero-shot) | No disponible | No disponible | 51,2 % | Propietaria | API de Anthropic |
| TF-IDF + regresion logistica | No aplica | No aplica | 59,9 % | No aplica | Implementacion propia |

La comparacion con modelos genericos de proposito general no es directa: este adaptador solo resuelve una tarea de clasificacion muy concreta y no compite en generacion, codigo ni razonamiento.

## Limitaciones y advertencias

- Solo ve el pie de foto: no analiza el video, el audio ni la cuenta, por lo que ignora factores decisivos del rendimiento real.
- Datos mayoritariamente en ingles y de TikTok; otras plataformas e idiomas no estan probados.
- El 62,7 % supera el azar y a Haiku, pero es una ayuda de ranking, no un oraculo; el margen sobre un modelo de palabras es de solo 2,8 puntos y no es estadisticamente significativo.
- Sesgo posicional documentado en el modelo base (responde "A" el 90 % de las veces); es imprescindible consultar en ambos ordenes y promediar.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribucion; hay que contactar con el autor antes de integrarlo en produccion.
- El dataset de entrenamiento no se publica, lo que dificulta auditar sesgos de nicho, idioma o tipo de creador.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de sobreconfianza: las probabilidades no estan calibradas mas alla de la evaluacion reportada.
- Dependencias fragiles: requiere `flash-linear-attention` y `causal-conv1d` para rendimiento aceptable, y el autor advierte de un posible error de version de `torchao` al cargar.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lollygag/hook-judge-qwen3.5-4b
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Adaption (AutoScientist): no disponible
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
