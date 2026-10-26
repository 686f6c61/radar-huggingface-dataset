# SketchyAI/tintin-flux3-klein-LoRA

## Resumen

`SketchyAI/tintin-flux3-klein-LoRA` es un adaptador LoRA de estilo para generación de imágenes, no un modelo completo. Lo publica el usuario SketchyAI y está diseñado para cargarse junto a `black-forest-labs/flux-3-image-klein-base`, el modelo de difusión de Black Forest Labs. El adaptador desplaza el estilo de salida hacia la estética de cómic de línea clara asociada a Tintín, mediante un prompt de activación (`tintin_comic`) y una leyenda descriptiva detallada de la escena.

El repositorio ocupa 0,3 GB y contiene únicamente las matrices LoRA en safetensors (rango 64, alpha 64). El transformer del modelo base, de aproximadamente 5.600 millones de parámetros, el codificador de texto Qwen3-VL-4B y el VAE permanecieron congelados durante el entrenamiento, que se realizó con `ostris/ai-toolkit` sobre 949 imágenes de viñetas de cómic anotadas en inglés.

Su relevancia es acotada: se publicó el 25 de octubre de 2026 sin descargas ni valoraciones, sin evaluación cuantitativa y con un único backend de inferencia verificado por el autor. Resulta útil como ejemplo reproducible de entrenamiento de adaptadores de estilo sobre FLUX 3 Klein y como pieza de prototipado creativo, no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango (rank 64, alpha 64) sobre el transformer de difusión de FLUX 3 Image Klein Base; codificador de texto Qwen3-VL-4B y VAE del modelo base, congelados |
| Parametros totales | Adaptador: no disponible (repo de 0,3 GB en safetensors); modelo base: ~5,6 B en el transformer, más Qwen3-VL-4B en el codificador de texto y el VAE |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; el autor no publica límite de tokens para el codificador de texto) |
| Tipos de cuantizacion | El adaptador se entrenó y publica en bf16; no se documentan cuantizaciones del adaptador. El modelo base admite los formatos que soporte cada loader, sin verificación por parte del autor |
| Idiomas soportados | no disponible; las leyendas de entrenamiento están en inglés |
| Licencia | `other` (FLUX Kommunity License, según `LICENSE.md` y `NOTICE.md` del repo) |
| Formato de pesos | `safetensors` (`tintin-flux3-klein-lora.safetensors`) |
| Rango / alpha de LoRA | 64 / 64 |
| Resolucion de entrenamiento | 512 px (configuración `[512]`) |
| Prompt de activacion | `tintin_comic` |
| Paso de checkpoint publicado | 3000 (de 3000 updates planificados) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre la arquitectura del modelo base: un transformer de difusión de ~5,6 B de parámetros para la generación de latentes, un codificador de texto Qwen3-VL-4B y un VAE. Solo se optimizaron las matrices LoRA de rango 64 con alpha 64; el resto de pesos quedó congelado. El entrenamiento se ejecutó con `ostris/ai-toolkit` (commit `73ebae13a468942ded8b47991b5d56eeeea25c36`), en precisión bf16, optimizador AdamW, tasa de aprendizaje 5e-05, micro-lote de 1 con acumulación de 4 (lote efectivo de 4) y resolución de 512 px, durante 3000 updates.

El conjunto de datos lo componen 949 imágenes de viñetas de cómic con leyendas en inglés aportadas por el autor, más 51 imágenes de validación (holdout). El checkpoint publicado corresponde a 3000 pasos, equivalentes a unas 12,64 pasadas sobre el conjunto de entrenamiento. El autor no publica métricas de validación, curvas de pérdida ni comparación entre checkpoints, ni indica si hubo aumento de datos, recorte de las imágenes o regularización de clase. Las imágenes del dataset no se distribuyen en el repositorio.

## Capacidades

- Generación de imágenes de viñeta de cómic con estética de línea clara, condicionada por una leyenda descriptiva detallada.
- Aplicación de estilo mediante el prompt de activación `tintin_comic`, combinable con la descripción de escena, personajes y encuadre.
- Producción de ilustraciones de panel único aptas para maquetas, storyboards y pruebas de concepto visuales.
- Control de composición y contenido a través del texto: el adaptador no aporta capacidades de control estructural (pose, profundidad, segmentación) por sí mismo.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un adaptador de difusión, no un modelo de lenguaje.
- No genera texto, código ni matemáticas; el lettering y los rótulos dentro de la imagen pueden aparecer imperfectos, según advierte el propio autor.
- Capacidades multilingües: no documentadas; las leyendas de entrenamiento son en inglés, lo que hace esperable un mejor ajuste al prompt en ese idioma.
- Requiere el modelo base completo (transformer, codificador Qwen3-VL-4B y VAE); el adaptador por sí solo no es funcional.

## Casos de uso

- **Storyboard y preproducción audiovisual**: generar viñetas rápidas de una secuencia a partir de descripciones de plano (encuadre, acción, personajes), usando `tintin_comic` para mantener coherencia estética entre paneles y acelerar la revisión con dirección antes de producir arte final.
- **Prototipado de estilo editorial**: evaluar una estética de línea clara para una publicación antes de encargar ilustración definitiva, ajustando fuerza del LoRA (0,85 como punto de partida) y CFG (3,5) para explorar variantes.
- **Maquetación de páginas de cómic**: producir paneles sueltos que se recortan y recomponen en una herramienta de maquetación, con el modelo como generador de material de relleno en pruebas de ritmo y paginación.
- **Investigación sobre adaptadores de estilo**: caso de estudio reproducible de LoRA de rango 64 sobre FLUX 3 Klein con configuración de entrenamiento documentada (`training_config.json`, `training_info.json`), útil para comparar recetas de ajuste fino y detectar sobreajuste.
- **Evaluación comparativa de checkpoints**: al estar documentado el paso 3000 sobre 3000 planificados, sirve como referencia para estudiar cómo evoluciona fidelidad al estilo y adherencia al prompt en el último tramo del entrenamiento.
- **Docencia y talleres de difusión**: ejemplo práctico de sustitución de estilo en modelos texto-a-imagen, con hiperparámetros y prompt de activación explícitos para que el alumnado replique el flujo en ai-toolkit.
- **Generación de material conceptual para fanzines y pruebas internas**: borradores de ilustración para validar dirección creativa, teniendo en cuenta las restricciones de licencia y de derechos sobre el personaje antes de cualquier uso público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los ejemplos mostrados son ilustraciones cualitativas y no una evaluación comparativa, y no aporta métricas de fidelidad al prompt, FID, CLIP score ni comparaciones con otros adaptadores.

## Requisitos de hardware

- **Espacio en disco**: 0,3 GB para el adaptador; a ello se suma el modelo base completo, que debe descargarse aparte.
- **VRAM estimada (cálculo a partir del número de parámetros, no verificado por el autor)**: en bf16, transformer de ~5,6 B (~11,2 GB) más codificador Qwen3-VL-4B (~8 GB) más VAE, lo que sitúa los pesos en torno a 20 GB antes de activaciones; en fp8 los pesos bajarían a unos 10-11 GB, con margen para activaciones según resolución.
- **GPU de datacenter**: A100 40/80 GB y H100 son suficientes con holgura en bf16 a resoluciones moderadas; la serie L40S o A6000 de 48 GB también encaja.
- **GPU de consumo**: en bf16, una RTX 3090 o RTX 4090 de 24 GB queda justa y probablemente exige descarga parcial del codificador de texto; con cuantización del modelo base a fp8 o GGUF es razonable esperar que quepa en 16-24 GB, aunque el autor no lo verifica.
- **Despliegue**: el único backend verificado por el autor es el nativo `flux3` de `ostris/ai-toolkit`. No hay garantía de compatibilidad con ComfyUI, diffusers, vLLM, llama.cpp, Ollama ni TGI; estos entornos no son aplicables o no están comprobados para este adaptador.
- **Parámetros de inferencia recomendados por el autor**: 50 pasos de muestreo, CFG 3,5, fuerza de LoRA 0,85 sobre Klein Base. Las previsualizaciones durante el entrenamiento usaron 28 pasos, cifra independiente del número de updates.
- **Latencia y throughput**: no disponibles. A 50 pasos por imagen, el coste es sensiblemente mayor que el de configuraciones de 20-30 pasos habituales en difusión, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SketchyAI/tintin-flux3-klein-LoRA` | Adaptador LoRA r64 sobre base de ~5,6 B; repo 0,3 GB | No disponible | Sin métricas publicadas; validación solo cualitativa | `other` (FLUX Kommunity License) | HuggingFace, 0 descargas, 0 likes |
| `black-forest-labs/flux-3-image-klein-base` (sin adaptador) | ~5,6 B en transformer + Qwen3-VL-4B + VAE | No disponible | No disponible en la información proporcionada | FLUX Kommunity License (modelo base) | Modelo oficial de Black Forest Labs |
| Otros LoRA de estilo para FLUX 3 Klein | No disponible | No disponible | No disponible | Variable según autor | No identificados en la búsqueda realizada |

No se dispone de datos verificables de adaptadores alternativos de la misma categoría (LoRA de estilo de cómic sobre FLUX 3 Klein) en la información consultada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- **Anatomía y lettering**: el autor advierte que la anatomía de los personajes, los rótulos y la adherencia al prompt pueden ser imperfectos; no hay métricas que cuantifiquen el fallo.
- **Riesgo de sobreajuste**: el checkpoint publicado es el paso final (3000 de 3000) y no se reportan métricas sobre las 51 imágenes de validación, por lo que no puede descartarse sobreajuste al conjunto de 949 imágenes.
- **Resolución de entrenamiento baja**: el ajuste se hizo a 512 px, lo que puede degradar la coherencia a resoluciones superiores.
- **Idioma**: las leyendas son en inglés; el comportamiento con prompts en castellano no está documentado y es esperable un rendimiento inferior.
- **Derechos sobre el personaje**: el adaptador reproduce el universo gráfico de Tintín, obra protegida. La licencia del repositorio no concede derechos sobre la propiedad intelectual del personaje ni autoriza su explotación comercial; cualquier uso público requiere evaluación legal independiente.
- **Licencia FLUX Kommunity License**: se trata de una licencia `other` con condiciones propias (recogidas en `LICENSE.md` y `NOTICE.md`), no una licencia de código abierto estándar; conviene revisar restricciones de uso comercial y de redistribución antes de integrarla en un producto.
- **No es un producto oficial**: el autor declara que es un modelo modificado de forma independiente y no respaldado por Black Forest Labs.
- **Compatibilidad de carga limitada**: solo se verificó con el backend `flux3` de ai-toolkit; otros loaders pueden fallar o producir resultados distintos.
- **Ausencia de validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros sobre calidad o estabilidad.
- **Alucinación visual**: como todo modelo de difusión, puede inventar detalles inexistentes en el prompt (texto ilegible, elementos fuera de lugar) sin señal de incertidumbre.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/SketchyAI/tintin-flux3-klein-LoRA
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Repositorio del entrenador (ostris/ai-toolkit): https://github.com/ostris/ai-toolkit
- Ficheros de licencia y atribución del repo: `LICENSE.md` y `NOTICE.md` en https://huggingface.co/SketchyAI/tintin-flux3-klein-LoRA
- Configuración y metadatos de entrenamiento: `training_config.json` y `training_info.json` en https://huggingface.co/SketchyAI/tintin-flux3-klein-LoRA
- Paper, blog o demo adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
