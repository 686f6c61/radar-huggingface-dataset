# realrebelai/Fibo-1.5_GGUFs

## Resumen

El repositorio realrebelai/Fibo-1.5_GGUFs contiene cuantizaciones GGUF del modelo de generación de imágenes BRIA Fibo 1.5, desarrollado originalmente por BRIA AI. Estas cuantizaciones permiten ejecutar Fibo 1.5 en entornos con recursos limitados, como GPUs de consumo, mediante el runtime ComfyUI-Fibo-GGUF. El modelo base es un transformer de difusión que utiliza un text encoder basado en SmolLM3 y una VAE Wan de 48 canales. Se ofrecen siete niveles de cuantización, desde Q2_K (máxima compresión) hasta Q8_0 (alta fidelidad), para que los usuarios puedan equilibrar tamaño, uso de memoria y calidad de salida. La relevancia actual radica en la creciente demanda de modelos de imagen ejecutables localmente con hardware asequible, sin renunciar a la calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Fibo) con text encoder SmolLM3 y VAE Wan de 48 canales |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de generación de imágenes) |
| Tipos de cuantización | Q2_K, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a la licencia upstream de BRIA Fibo 1.5) |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo original, BRIA Fibo 1.5, es un modelo de difusión basado en transformer. La información disponible no detalla el número de parámetros ni la composición del dataset de entrenamiento. Fibo 1.5 es un modelo destilado, diseñado para operar sin amplificación de CFG (se recomienda CFG 1.0), y requiere un text encoder SmolLM3 y una VAE Wan de 48 canales para funcionar. La innovación técnica de este repositorio es la cuantización GGUF con metadatos `general.architecture = fibo`, que exige un runtime específico (ComfyUI-Fibo-GGUF junto con City96/ComfyUI-GGUF). Un cargador GGUF estándar no es capaz de reconocer el modelo porque Fibo no es simplemente Flux o Wan bajo otro nombre.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts detallados.
- Adherencia a prompts estructurados: el modelo es sensible a la estructura del prompt y responde mejor a descripciones JSON con objetos, posiciones, materiales, iluminación y estilo.
- Múltiples niveles de cuantización (Q2_K, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0) para adaptarse a distintos presupuestos de memoria.
- Integración con ComfyUI mediante nodos personalizados (ComfyUI-Fibo-GGUF).
- No soporta tool calling, agentes ni razonamiento multi-step (modelo de imagen).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Diseño conceptual para cine y publicidad: generar imágenes fotorrealistas con prompts JSON estructurados para controlar composición, iluminación y estilo. La cuantización Q5_K_M o Q6_K preserva mejor la fidelidad.
- Prototipado de assets para videojuegos: crear texturas y conceptos en local con cuantizaciones Q4_K_M o Q5_K_M, lo que permite iterar rápidamente sin depender de servicios en la nube.
- Investigación en compresión de modelos de difusión: comparar el efecto de cada tier de GGUF mediante pruebas A/B controladas con el mismo prompt, semilla y configuración.
- Generación de contenido para redes sociales: producir imágenes de producto o lifestyle con estilo fotográfico, aprovechando la adherencia a prompts detallados.
- Entornos con recursos limitados: usar Q2_K o Q3_K_M en GPUs de consumo para experimentación básica o validación de ideas.
- Evaluación de adherencia a prompts estructurados: probar la sensibilidad del modelo a descripciones JSON y ajustar la formulación de prompts para obtener resultados precisos.
- Ilustración técnica o documental: generar imágenes de referencia con la VAE Wan de 48 canales para documentos o presentaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (depende del tier de cuantización y de la resolución de salida).
- GPU recomendadas: no disponible (los tiers Q2_K y Q3_K_M están pensados para baja memoria, pero no se especifican modelos concretos).
- Compatibilidad con GPU de consumo: probablemente sí con los tiers más pequeños, aunque no se confirma.
- Opciones de despliegue: ComfyUI con ComfyUI-Fibo-GGUF y City96/ComfyUI-GGUF. El modelo debe cargarse con el nodo "Fibo GGUF Loader".
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la información disponible.

## Limitaciones y advertencias

- El repositorio solo contiene los pesos cuantizados del transformer. Se necesitan por separado el text encoder SmolLM3 (como .safetensors), la VAE Wan de 48 canales, la configuración y el tokenizer.
- Requiere un runtime específico (ComfyUI-Fibo-GGUF); un cargador GGUF estándar puede no reconocer el modelo.
- La cuantización puede degradar texturas finas, manos, tipografía y pequeños detalles estructurados.
- El modelo es sensible a la estructura del prompt; los prompts cortos pueden no cumplir propiedades específicas.
- La licencia "other" está sujeta a los términos del modelo original de BRIA; es necesario revisarlos antes de uso comercial.
- No se han publicado benchmarks ni evaluaciones de las cuantizaciones, por lo que el rendimiento relativo debe validarse con pruebas propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/realrebelai/Fibo-1.5_GGUFs
- Perfil de realrebelai: https://huggingface.co/realrebelai
