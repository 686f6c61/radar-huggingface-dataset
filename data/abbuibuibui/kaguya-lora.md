# abbuibuibui/kaguya-Lora

## Resumen

Kaguya-Lora es un LoRA de personaje (character LoRA) para modelos de difusion de la familia Stable Diffusion XL (SDXL), concretamente entrenado sobre el checkpoint comunitario waiIllustriousSDXL v17, un modelo derivado de Illustrious. Lo desarrolla el usuario abbuibuibui y reproduce la identidad visual de Kaguya Shinomiya, personaje del manga y anime Kaguya-sama: Love is War. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se aplica sobre un modelo base SDXL para condicionar la generacion de imagenes hacia ese personaje concreto.

El repositorio contiene los pesos de siete epocas (E1-E7) del entrenamiento, ademas de una segunda variante alojada en el subdirectorio moss/ orientada a MOSS-Image, que no debe mezclarse con la variante principal ni con sus prompts. La evaluacion comparativa del autor recomienda la epoca E5 con una fuerza de LoRA de 0.8 como configuracion por defecto, al ofrecer el mejor equilibrio entre fidelidad facial y el uniforme escolar de vestido negro.

Su relevancia es la habitual en el ecosistema de LoRAs de personaje para generacion de imagenes: permite incorporar un personaje concreto a pipelines de SDXL/Illustrious con un coste de almacenamiento reducido (repo de 3,1 GB que incluye las siete epocas) y con documentacion de evaluacion poco habitual en este tipo de adaptadores, incluyendo matrices de fuerza y comparativas publicas por epoca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet y ambos text encoders de SDXL / Illustrious |
| Parametros totales | no disponible (rango de red dim 32, alpha 16; numero exacto de parametros no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible (pesos en bf16 durante el entrenamiento; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en, zh (etiquetas del repositorio; los prompts de ejemplo estan en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un LoRA de difusion aplicado sobre waiIllustriousSDXL v17 (fichero habitual `waiIllustriousSDXL_v170`), un checkpoint de la familia Illustrious/NoobAI construido sobre SDXL. El adaptador se entrena sobre la UNet y sobre ambos text encoders, con rango de red (network dim) 32 y alpha 16. El entrenamiento uso AdamW de 8 bits, precision bf16 y atencion SDPA. El dataset consta de 42 imagenes: 34 con la etiqueta `kaguya_school_uniform` y 8 con `kaguya_casual`. Se aplicaron 3 repeticiones durante 7 epocas, lo que da un total de 882 pasos. Las leyendas (captions) se generaron con `keep_tokens = 2` y `shuffle_caption = true`. La model card indica que el log guardado no imprime la tasa de aprendizaje, por lo que no se declara.

El repositorio publica exclusivamente los pesos por epoca, no los checkpoints intermedios por paso. La seleccion de la epoca recomendada (E5) se hizo mediante una evaluacion en dos rondas: una primera criba de E1-E7 a fuerza 0.8 sobre un retrato y un cuerpo completo con uniforme escolar (14 imagenes), que descarto E3 (resplandor duro en el retrato) y penalizo E1 (mangas claras en el uniforme) y E7 (anade adornos rojos en el pelo). Solo E1, E5 y E7 pasaron a la matriz de fuerza, que genero 9 escenas a fuerzas 0.4, 0.6, 0.8 y 1.0 (108 imagenes): frontal, tres cuartos, perfil, cuerpo completo escolar, cuerpo completo casual, sentada, calle nocturna, sin palabras de vestimenta y sin trigger. E5 a 0.8 resulto el mejor equilibrio.

## Capacidades

- Generacion de imagenes de un personaje concreto (Kaguya Shinomiya) condicionada por el trigger `kaguya_shinomiya`, con rasgos estables: pelo negro, ojos rojos y pelo largo.
- Control de vestimenta mediante tokens de outfit: `kaguya_school_uniform` (vestido negro, cuello blanco, cinta roja) y `kaguya_casual` (funciona mejor en planos sentados que en cuerpo completo de pie).
- Composicion de escenas y angulos: retrato frontal, tres cuartos, perfil, cuerpo completo, plano sentado y escena nocturna en calle con neon.
- Integracion con ecosistema diffusers y con interfaces de Stable Diffusion (prompts con sintaxis `<lora:nombre:fuerza>`).
- Ajuste fino de la intensidad del personaje mediante la fuerza del LoRA (0.4-1.0), con comportamiento documentado en cada rango.
- Soporte de prompts negativos estandar para calidad y anatomia.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un adaptador de imagen.

## Casos de uso

- Ilustracion de fan art de Kaguya-sama: el LoRA permite generar ilustraciones del personaje con identidad consistente usando el trigger `kaguya_shinomiya` y el token de uniforme, con ajustes documentados (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216) que reproducen los resultados de la model card.
- Creacion de paneles para doujinshi o comic amateur: la matriz de evaluacion cubre angulos frontal, tres cuartos y perfil, lo que facilita mantener la coherencia del personaje entre viñetas de una misma secuencia.
- Generacion de avatares y retratos de perfil: la epoca E5 a fuerza 0.8 esta optimizada para retrato simetrico, segun la evaluacion del autor, lo que la hace adecuada para imagenes de cabecera o avatares.
- Escenas ambientadas (calle nocturna con neon): el LoRA conserva el vestido negro, el cuello blanco y el lazo rojo en entornos nocturnos, util para ilustraciones de atmosfera urbana.
- Prototipado rapido de personajes en pipelines de SDXL/Illustrious: al ser un adaptador ligero sobre un checkpoint comunitario, se puede cargar y descargar en flujos de diffusers sin reentrenar el modelo base.
- Investigacion sobre entrenamiento de LoRAs de personaje: el repositorio publica las siete epocas, el dataset y una evaluacion comparativa detallada, lo que sirve como referencia metodologica para estudiar el efecto de la epoca y la fuerza en la fidelidad de personaje.
- Variantes de vestuario: el token `kaguya_casual` permite experimentar con ropa alternativa, aunque el autor advierte que solo hay 8 imagenes de entrenamiento para esa etiqueta y funciona mejor en planos sentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (FID, CLIP score, etc.) en la informacion disponible. El autor aporta una evaluacion cualitativa estructurada:

| Evaluacion | Configuracion | Resultado documentado |
|---|---|---|
| Ronda 1 (criba de epocas) | E1-E7 a fuerza 0.8, 14 imagenes | E3 descartada por resplandor duro en retrato; E1 mantiene mangas claras; E7 anade adornos rojos; pasan E1, E5 y E7 |
| Matriz de fuerza | E1/E5/E7 x 0.4/0.6/0.8/1.0, 9 escenas, 108 imagenes | E5 a 0.8: mejor equilibrio entre cara simetrica y vestido negro |
| Fuerza 0.6 | E5 | Ya identifica al personaje |
| Fuerza 1.0 | E5 | Sobreajuste: gira las caras y bloquea las manos |
| Fuerza 1.0 | E7 | Sobreajuste confirmado por el autor |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el LoRA; depende del checkpoint base waiIllustriousSDXL v17, no del adaptador. El LoRA anade una sobrecarga minima sobre el modelo base.
- GPU recomendadas: no documentadas por el autor. Al tratarse de SDXL a 832x1216, se requiere una GPU con VRAM suficiente para el modelo base completo; no se aportan cifras concretas.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende del checkpoint base y de la precision de carga.
- Opciones de despliegue: libreria diffusers (declarada en el repositorio) y entornos compatibles con LoRAs de SDXL que acepten safetensors y la sintaxis `<lora:...>`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros LoRAs de personaje comparables en la informacion proporcionada (no se aportan alternativas de Kaguya Shinomiya ni metricas cruzadas). Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kaguya-Lora (E5) | no disponible (LoRA dim 32, alpha 16) | no aplica | evaluacion cualitativa del autor | creativeml-openrail-m | Hugging Face, 154 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un derivado no oficial (fan-made): los derechos del personaje y de la obra pertenecen a Aka Akasaka / Shueisha. No es un producto oficial.
- Licencia creativeml-openrail-m: impone restricciones de uso comercial que deben revisarse antes de cualquier explotacion en produccion; no se detallan aqui las clausulas concretas.
- El token `kaguya_casual` es debil en cuerpo completo de pie y solo cuenta con 8 imagenes de entrenamiento; las tomas sentadas si cambian a camisa blanca.
- A fuerza 1.0 el modelo sobreajusta: gira las caras y bloquea las manos, segun la evaluacion del autor. Se recomienda 0.8.
- E7 tiende a colocar una cinta roja detras del pelo a partir de fuerza media; E1 puede mostrar mangas claras en lugar del vestido negro en cuerpo completo y perfil.
- El repositorio contiene dos familias de modelos (raiz WAI/Illustrious y subdirectorio moss/ para MOSS-Image); mezclar modelos base o prompts entre ambas produce resultados incorrectos.
- Riesgo de alucinacion visual y artefactos anatomicos inherente a los modelos de difusion; el autor recomienda un prompt negativo extenso (lowres, bad anatomy, bad hands, etc.).
- La tasa de aprendizaje del entrenamiento no se declara en la model card, lo que limita la reproducibilidad exacta.
- El dataset es pequeno (42 imagenes), lo que restringe la variedad de poses, angulos y vestuarios cubiertos.
- Idiomas declarados en/zh; la calidad de seguimiento de prompts en otros idiomas no esta documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/kaguya-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/kaguya-Dataset
- README en chino: https://huggingface.co/abbuibuibui/kaguya-Lora/blob/main/README_zh.md
- Registro de evaluacion (en chino): https://huggingface.co/abbuibuibui/kaguya-Lora/blob/main/evaluation/%E6%A8%AA%E5%90%91%E6%B5%8B%E8%AF%84%E8%AE%B0%E5%BD%95.md
- Modelo base waiIllustriousSDXL v17: no disponible como enlace en la informacion proporcionada
