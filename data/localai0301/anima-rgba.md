# localai0301/Anima-RGBA

## Resumen

Anima RGBA es un complemento para el modelo de generación de imágenes Anima (circlestone-labs/Anima) que permite producir imágenes PNG con canal alfa real, es decir, con fondo transparente auténtico en lugar de un fondo opaco simulado. Lo desarrolla el usuario localai0301 y se distribuye bajo licencia Apache 2.0. Se compone de dos piezas: un VAE de 4 canales derivado del VAE de Qwen-Image que utiliza Anima, y un LoRA entrenado sobre los latentes de ese VAE para que el modelo base genere latentes que el VAE decodifique con un canal alfa limpio.

El problema que resuelve es concreto: los modelos de difusión de texto a imagen convencionales generan RGB de tres canales y no pueden representar transparencia. Anima RGBA añade esa cuarta dimensión sin necesidad de nodos personalizados en ComfyUI, manteniendo el espacio latente del modelo original para no romper su comportamiento. El repositorio ocupa 0,7 GB y contiene el VAE completo (508 MB) y el LoRA (184 MB, checkpoint en el paso 25.000).

Es relevante para flujos de producción que necesitan recortes limpios de personajes y objetos para composición, diseño gráfico o pipelines de assets, donde históricamente había que recurrir a segmentación posterior o a modelos especializados en matting. Aquí la transparencia se genera de forma nativa durante la difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE convolucional de 4 canales (encoder + decoder) sobre base Qwen-Image VAE, más LoRA para el DiT de Anima |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión no especificada) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (VAE y LoRA por separado) |

## Arquitectura y entrenamiento

El VAE RGBA parte del VAE de Qwen-Image que usa Anima. Se copian los pesos de los tres canales originales y se añade una columna de entrada para el alfa inicializada a cero y una fila de salida para el alfa inicializada a cero con sesgo +1, de modo que antes de entrenar el modelo se comporta exactamente como el VAE original y decodifica todo como opaco. La entrada del encoder es RGB compuesto sobre blanco más el canal alfa (4 canales), y la salida del decoder es RGB directo (sin premultiplicar) más alfa. El latente sigue siendo de 16 canales con factor de compresión 1/8, igual que el original, con una deriva pequeña.

El entrenamiento del VAE se hizo con 12.000 pasos, batch de 4 y recortes aleatorios de 512 px, con learning rate de 1e-5 para el encoder y 5e-5 para el decoder, y 500 pasos de calentamiento. La función de pérdida combina L1 de las composiciones sobre fondos sólidos aleatorios (peso 1,0), LPIPS (0,2), L1 del alfa (1,0), L1 del gradiente Sobel del alfa (0,5) y MSE de latentes de referencia contra el encoder original congelado (0,1). Un 15 % de cada batch son imágenes opacas de regularización. Los datos de entrenamiento incluyen 16.496 imágenes transparentes y 3.032 opacas, con filtros para excluir falsas transparencias (checkerboards dibujados) y duplicados casi idénticos mediante dHash de RGB y alfa.

El LoRA se entrenó sobre latentes de este VAE con un dataset de 18.426 imágenes (27.934 muestras por época): 4.754 imágenes con zonas semitransparentes repetidas 3 veces, 11.742 transparentes normales y 1.930 opacas de un solo personaje como regularización. Las imágenes se reescalan a un lado máximo de 1536 px. La innovación técnica clave es la pérdida de referencia de latentes, que mantiene el espacio latente alineado con el del modelo base para que el LoRA solo tenga que aprender el pequeño residuo del alfa.

## Capacidades

- Generación de imágenes de texto a imagen con canal alfa real (RGBA), no simulado.
- Producción de PNG con transparencia directamente desde ComfyUI mediante `Save Image`, sin nodos personalizados.
- Compatibilidad con el ecosistema Anima y su pipeline de difusión (DiT).
- Control de la transparencia mediante el trigger `transparent background` o `isolated on a transparent background` en el prompt.
- Ajuste fino del efecto subiendo el peso del trigger (por ejemplo `(transparent background:1.3)`) en lugar de la fuerza del LoRA.
- Soporte de zonas semitransparentes (el subconjunto `semi` del dataset lo contempla explícitamente).
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo; es un componente de generación de imagen.

## Casos de uso

- Producción de assets para videojuegos: generar sprites y retratos de personajes con fondo transparente directamente, sin pasos posteriores de segmentación, gracias al canal alfa nativo del VAE.
- Diseño gráfico y composición: obtener recortes limpios de objetos y personajes para superponerlos sobre otras imágenes o fondos, usando el alfa directo en lugar de un matting aproximado.
- E-commerce y catálogo de producto: generar imágenes de producto aisladas sobre transparencia para fichas de tienda, con la ventaja de que el modelo produce el recorte desde el prompt.
- Ilustración y cómic: crear personajes con cabello, telas o efectos semitransparentes (alas, halos, magia) que requieren alfa parcial, cubierto por el subconjunto `semi` del entrenamiento.
- Automatización de pipelines de marketing: integrar el LoRA y el VAE en flujos ComfyUI existentes cambiando solo tres nodos (VAE, LoRA y trigger), lo que permite escalar la generación de creatividades con fondo transparente.
- Prototipado rápido de UI y recursos web: generar iconos y elementos gráficos con transparencia para maquetas, aprovechando que la salida es un PNG RGBA listo para usar.
- Investigación en generación con alfa: servir como referencia reproducible de cómo adaptar un VAE RGB a RGBA manteniendo el espacio latente, con métricas publicadas de MAE y RMSE de alfa.

## Benchmarks y rendimiento

El autor publica métricas del VAE sobre un conjunto de validación de 512 px con 200 imágenes transparentes y 50 opacas, no usadas en entrenamiento.

| Metrica | Valor |
|---|---|
| Alpha MAE (imagenes transparentes) | 0,0027 (≈ 0,7 / 255) |
| Alpha RMSE (imagenes transparentes) | 0,0157 (≈ 4 / 255, error concentrado en bordes) |
| PSNR compuesto sobre blanco | 34,94 dB |
| PSNR compuesto sobre negro | 33,17 dB |
| PSNR RGB en imagenes opacas, VAE original | 34,26 dB |
| PSNR RGB en imagenes opacas, Anima RGBA VAE | 34,74 dB (+0,48) |
| Deriva de latentes (RMS, en unidades de desviacion estandar) | 0,058 (≈ 6 %) |

No se han publicado resultados de benchmarks de generación (FID, CLIP score u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base Anima y de la resolución. El VAE pesa 508 MB y el LoRA 184 MB, cantidades pequeñas frente al modelo de difusión principal.
- GPU recomendadas: no disponibles en la información proporcionada. Al ejecutarse sobre Anima, los requisitos vendrán determinados por ese modelo base.
- ¿Cabe en GPU de consumo? No disponible; el componente añadido es ligero, pero el conjunto depende de Anima.
- Opciones de despliegue: ComfyUI es el flujo documentado (VAE en `models/vae`, LoRA en `models/loras`, cargador LoRA estándar con fuerza 1.0). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La configuración de ejemplo usa 30 pasos, CFG 4.5 y sampler er_sde / simple a 1024 × 1024.

## Comparativa con modelos similares

| Modelo | Tipo | Canal alfa | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anima RGBA | VAE + LoRA sobre Anima | Sí, RGBA nativo | 1024 × 1024 en ejemplos | Apache 2.0 | Hugging Face, ComfyUI |
| Anima (base) | Modelo de difusión texto a imagen | No (RGB) | No disponible | No disponible | Hugging Face |
| VAE original de Qwen-Image | VAE RGB | No | 1/8 de compresión | No disponible | Incluido en Anima |

No se dispone de datos de otros modelos especializados en generación con transparencia en la información proporcionada, por lo que la comparativa se limita al ecosistema Anima y Qwen-Image.

## Limitaciones y advertencias

- El LoRA y el VAE deben usarse juntos: sin el LoRA el VAE produce un canal alfa borroso, porque los latentes del modelo base solo encajan aproximadamente con lo que el VAE espera.
- Subir la fuerza del LoRA por encima de 1.0 (por ejemplo 1.5) introduce residuos semitransparentes alrededor del sujeto; el ajuste correcto es aumentar el peso del trigger en el prompt.
- El error de alfa se concentra en los bordes (RMSE ≈ 4/255), lo que puede requerir revisión en recortes de precisión.
- Existe una deriva de latentes del 6 % respecto al VAE original que el LoRA debe compensar; puede afectar sutilmente a la fidelidad en imágenes opacas.
- No se documentan sesgos conocidos ni evaluación multilingüe; los prompts de ejemplo están en inglés.
- Riesgo de alucinación y de artefactos propio de los modelos de difusión; no se publican tasas de fallo.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Anima, que no se detalla en la información disponible.
- El repositorio no especifica precisión de pesos ni cuantizaciones soportadas, lo que limita la planificación de despliegues con requisitos estrictos de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localai0301/Anima-RGBA
- Modelo base Anima: https://huggingface.co/circlestone-labs/Anima
- Ejemplos RGBA en el repositorio: carpeta `examples/` del repositorio de Hugging Face
