# abbuibuibui/SakuraKono-Lora

## Resumen
SakuraKono-Lora es un LoRA de personaje para modelos de difusión SDXL, entrenado específicamente sobre el checkpoint waiIllustriousSDXL v17. Lo desarrolla el usuario abbuibuibui y reproduce a Sakura Kono, personaje secundario de la serie Horimiya. El repositorio distribuye siete pesos correspondientes a las épocas E1–E7 del entrenamiento, con una recomendación explícita de usar E6 a fuerza 0.8 para uso general. Es un derivado no oficial, sin vinculación con los titulares de derechos de la obra.

El modelo resuelve un problema acotado: la generación consistente de un personaje concreto con rasgos estables (pelo castaño largo con flequillo recto, ojos castaños, gafas) y varios conjuntos de ropa etiquetados mediante tokens específicos. Su relevancia es práctica para quienes generan ilustraciones de fan art o material derivado con ComfyUI u otros frontends de SDXL, ya que la model card documenta con detalle el comportamiento de cada época, las fuerzas recomendadas y los fallos observados.

No es un modelo de lenguaje: es un adaptador de bajo rango (LoRA) para difusión de imágenes, con un tamaño de 3,2 GB en el repositorio y ficheros individuales de 456.495.868 bytes cada uno. La información disponible no incluye parámetros de entrenamiento, número de pasos ni composición exacta del dataset más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (modelo base waiIllustriousSDXL v17, familia Illustrious) |
| Parametros totales | no disponible (adaptador de bajo rango; fichero de 456.495.868 bytes por época) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa del adaptador) |
| Idiomas soportados | en, zh (etiquetas de la model card; los prompts de ejemplo están en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento
El adaptador se entrena sobre waiIllustriousSDXL v17, un checkpoint de la familia Illustrious derivada de SDXL, orientada a ilustración anime. El LoRA inyecta matrices de bajo rango en las capas del UNet del modelo base; la model card no detalla rangos, alpha, target modules ni hiperparámetros de entrenamiento, por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó sobre el dataset abbuibuibui/SakuraKono-Dataset, con captions que usan `keep_tokens = 2` y que, según el autor, conservan el token de identidad y el de ropa pero a menudo omiten color de pelo, color de ojos y la etiqueta `glasses`. Se conservan siete épocas: los ficheros `sakura_kono-000001.safetensors` a `sakura_kono-000006.safetensors` corresponden a E1–E6, y el fichero sin numerar `sakura_kono.safetensors` corresponde a E7 (no existe un `-000007`). El autor documenta una evaluación comparativa de E5, E6 y E7 sobre una matriz de 10 escenas por 4 fuerzas, y selecciona E6 como predeterminado. El SHA-256 de E6 es `9A45EE29A7A80D1D5E10DF14A237C25A4C5E58507BBE44CC074AC834C7F692B5`.

## Capacidades
- Generación de imágenes de un personaje concreto (Sakura Kono) condicionada por el token de identidad `sakura_kono`.
- Control de vestuario mediante tokens dedicados: `sakura_kono_school_uniform`, `sakura_kono_cooking_apron`, `sakura_kono_red_tracksuit` y `sakura_kono_sports_shirt`.
- Reproducción estable de rasgos faciales y de indumentaria a fuerzas de 0.6–0.8 sobre el modelo base recomendado.
- Compatibilidad con prompts de estilo anime e ilustración propios de Illustrious/NoobAI, incluyendo etiquetas de calidad como `masterpiece, best quality, very aesthetic, absurdres`.
- Integración con flujos de trabajo de ComfyUI y con la librería diffusers.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o vídeo: es exclusivamente un adaptador de difusión de imágenes.

## Casos de uso
- Fan art de personaje consistente: usar E6 a fuerza 0.8 con el prompt de ejemplo para obtener retratos y cuerpos completos con gafas, pelo castaño y uniforme escolar sin deriva de identidad entre generaciones.
- Ilustración de escenas cotidianas: combinar `sakura_kono_cooking_apron` a 0.6–0.8 para escenas de cocina con delantal rosa claro y manos entrelazadas, un comportamiento documentado por el autor.
- Series de imágenes para narrativa visual: mantener el mismo token de identidad y variar solo la escena y la pose, aprovechando que E6 conserva la cara y el uniforme en un rango de fuerza amplio.
- Pruebas comparativas de épocas: los ficheros E1–E7 permiten evaluar el efecto del sobreentrenamiento en un mismo personaje, útil para investigación sobre dinámica de entrenamiento de LoRAs.
- Integración en pipelines de diffusers: cargar el adaptador con la librería diffusers para generar lotes automatizados de ilustraciones en un servicio interno.
- Prototipado de personajes derivados: servir como referencia de cómo estructurar tokens de identidad y de vestuario en un LoRA de personaje para otros desarrolladores.
- Generación de material para comunidades de fan art: producir ilustraciones del personaje para foros o redes, respetando las restricciones de la licencia CreativeML OpenRAIL-M.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente una evaluación cualitativa por épocas:

| Candidato | Resultado observado | Decisión |
|---|---|---|
| E1 | Pelo y ojos castaños correctos, pero el retrato pierde las gafas con frecuencia; identidad débil en cuerpo completo | Alternativa temprana |
| E2–E4 | Las gafas vuelven; cara usable, menos asentada en cuerpo completo | Alternativa |
| E5 | Gafas estables en uniforme; delantal rosa claro a 0.8; bolsa azul en escena nocturna | Alternativa de matriz |
| E6 | Retrato y uniforme mantienen gafas y cara a 0.6–0.8; delantal rosa claro a 0.6–0.8 | Recomendado a 0.8 |
| E7 | Cara y uniforme cercanos a E6; delantal deriva a crema a 0.8 | Alternativa de época final |

## Requisitos de hardware
- El adaptador pesa 456.495.868 bytes por época; debe cargarse junto al checkpoint base waiIllustriousSDXL v17, cuyo peso no se especifica en la información disponible.
- VRAM estimada: no disponible de forma explícita; al ser un LoRA sobre SDXL, los requisitos son los del modelo base en la precisión y resolución elegidas (832×1216 en los ejemplos).
- GPU recomendadas: no especificadas por el autor. Para SDXL en general se suele requerir una GPU con al menos 8–12 GB de VRAM en cuantizaciones o precisiones reducidas, pero este dato no procede de la model card.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ComfyUI (flujo usado en los ejemplos, con Euler a, 28 pasos, CFG 4.5, CLIP skip 2) y la librería diffusers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de otros LoRAs de personaje comparables en la información proporcionada. La comparación solo puede establecerse frente a las propias épocas del mismo adaptador (ver tabla de la sección de benchmarks) y frente al modelo base:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SakuraKono-Lora (E6) | LoRA de personaje sobre SDXL | no disponible | no aplica | creativeml-openrail-m | Hugging Face |
| waiIllustriousSDXL v17 | Checkpoint SDXL completo | no disponible | no aplica | no disponible | modelo base referenciado |
| Otros LoRAs de personaje de Illustrious | LoRA de personaje | no disponible | no aplica | variable | no disponible en esta búsqueda |

## Limitaciones y advertencias
- Es un derivado no oficial: los derechos del personaje y de la obra original pertenecen a sus titulares; el autor lo declara explícitamente.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso, incluidas limitaciones sobre usos dañinos o prohibidos descritas en dicha licencia; debe revisarse antes de cualquier uso comercial.
- Las gafas se pierden con facilidad en tomas informales o sin token de vestuario; es necesario añadir `glasses` al prompt positivo.
- Los ojos pueden derivar a verde u oliva en primeros planos; el autor recomienda reforzar `brown eyes` en positivo y `green eyes` en negativo.
- El delantal de cocina a fuerza 1.0 deriva a color crema y puede aparecer una taza de café; se recomienda mantenerse en 0.6–0.8.
- Sin token de vestuario, a fuerza 0.8 el modelo genera una blusa malva de manga abullonada y pantalón corto carbón, y las gafas suelen desaparecer.
- Sin el token de identidad, a fuerza 0.8 todavía hay filtración hacia pelo castaño largo y un look escolar con cárdigan crema.
- El modelo está pensado para el checkpoint waiIllustriousSDXL v17 o merges de Illustrious/NoobAI; su comportamiento en otros modelos base no está documentado.
- No hay información sobre sesgos, tasas de alucinación visual ni evaluación cuantitativa de fidelidad al personaje.
- Los idiomas declarados (en, zh) se refieren a la documentación y a los prompts de ejemplo, no a una capacidad multilingüe del modelo de difusión.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/abbuibuibui/SakuraKono-Lora)
- [Dataset de entrenamiento](https://huggingface.co/datasets/abbuibuibui/SakuraKono-Dataset)
- [README en chino](./README_zh.md) (referenciado en la model card)
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos distintos de los anteriores.
