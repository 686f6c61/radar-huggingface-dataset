# dark00003/GOLD

## Resumen

GOLD (Geometric Optimized Latent Diffusion) es un modelo de aprendizaje profundo para el plegamiento inverso de ARN (RNA inverse folding): dado un esqueleto tridimensional de ARN, genera secuencias compatibles con esa estructura. Lo desarrolla un equipo de investigadores (Qi Si, Xuyang Liu, Penglei Wang, Shuo Su, Limei Han, Mengzhu Li, Xin Guo, Yuan Qi y Yuan Cheng) y se presenta como implementación oficial en PyTorch de un trabajo aceptado como Spotlight en NeurIPS 2026.

El modelo combina tres etapas: un autoencoder variacional geometrico (GeoVAE) que aprende una representación latente compartida de secuencias de ARN y ángulos de torsión de cadenas laterales; un modelo de difusión latente condicionado al esqueleto de ARN objetivo; y un muestreo guiado dual sin entrenamiento que impone restricciones de estructura secundaria y de colisión estérica.

No se trata de un modelo de lenguaje generativo de propósito general, sino de un modelo cientifico especializado en biología estructural computacional. El repositorio de Hugging Face ocupa 0,1 GB y contiene código de entrenamiento y muestreo, no pesos preentrenados listos para usar. Los recursos (splits de datos, estructuras PDB, embeddings RNA-FM y plantillas geométricas) se distribuyen externamente vía Google Drive.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GeoVAE (autoencoder variacional geometrico) + difusión latente condicionada al esqueleto + muestreo guiado dual |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre estructuras de ARN, no sobre texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch `.pt` (generados por el propio pipeline de entrenamiento; no se distribuyen pesos preentrenados en el repo) |

## Arquitectura y entrenamiento

GOLD se compone de tres modulos encadenados. El GeoVAE aprende un espacio latente conjunto de secuencia y geometria (dimension latente de 8 en la configuración del paper), separando la representación de la secuencia y de los ángulos de torsión de cadenas laterales. Sobre ese espacio latente se entrena un modelo de difusión condicionado al esqueleto de ARN objetivo, lo que traslada la generación al dominio latente y reduce el coste computacional frente a difusión directa sobre coordenadas.

La tercera etapa es un muestreo guiado dual sin entrenamiento adicional: durante la generación se aplican dos terminos de guia, uno para favorecer el emparejamiento de estructura secundaria (`w_secondary_structure`) y otro para evitar colisiones estéricas en 3D (`w_clash`). Anular ambos pesos produce la variante GOLD (Base) sin guia. El pipeline usa PyTorch, PyTorch Geometric (torch-scatter, torch-cluster), fair-esm, ViennaRNA, fr3d-python y biopython, y requiere calcular estadisticas latentes (`vae_latent_stats.pt`) con el checkpoint GeoVAE antes de entrenar la difusión. No se especifican en la información disponible el numero de tokens, la composición exacta del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Plegamiento inverso de ARN: genera secuencias de ARN compatibles con un esqueleto tridimensional dado.
- Modelado geometrico conjunto de secuencia y angulos de torsion de cadenas laterales mediante espacio latente.
- Difusion latente condicionada a estructura: permite muestreo controlado sobre el esqueleto objetivo.
- Muestreo guiado dual sin entrenamiento: restricciones de estructura secundaria y evitacion de colisiones estericas configurables por peso.
- Reconstruccion de estructuras PDB a partir de las muestras generadas.
- Evaluacion integrada con metricas de plegamiento inverso volcadas a CSV.
- Uso de embeddings precomputados de RNA-FM como representacion de entrada.
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, vision ni audio.

## Casos de uso

- Diseño de ARN terapeutico: a partir de una estructura 3D diana, GOLD genera candidatos de secuencia que pueden filtrarse por estructura secundaria y viabilidad esterica antes de sintesis.
- Aumento de datasets estructurales: generar secuencias alternativas compatibles con un mismo esqueleto para ampliar conjuntos de entrenamiento en tareas de biologia estructural.
- Validacion de estructuras experimentales: comprobar si una estructura PDB resuelta admite secuencias plausibles, detectando posibles errores de modelado.
- Investigacion en aptameros y ribozimas: explorar variantes de secuencia manteniendo el plegamiento tridimensional requerido para la funcion.
- Benchmarking de metodos de inverse folding: usar GOLD (Base) y GOLD con guia como lineas base reproducibles en comparaciones academicas.
- Estudio de restricciones fisicas en generacion: analizar el efecto de los pesos de guia sobre la calidad estructural y la tasa de colisiones, como experimento controlado.
- Formacion y docencia: reproducir un pipeline completo de VAE geometrico más difusión latente sobre datos de ARN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no incluye pesos preentrenados y el consumo depende de la configuracion de entrenamiento y muestreo.
- GPU recomendadas: no disponible de forma explicita; el pipeline requiere PyTorch y PyTorch Geometric compilados para la versión de CUDA instalada, lo que implica GPU con soporte CUDA.
- Viabilidad en GPU de consumo: no disponible; no se documentan requisitos minimos.
- Opciones de despliegue: ejecución via `python main.py --config configs/*.yaml`; no se contemplan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible; el muestreo por defecto usa `num_steps: 100`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento frente a alternativas de plegamiento inverso de ARN.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni mantiene conversaciones; cualquier uso en esos dominios es inadecuado.
- El repositorio no incluye pesos preentrenados; es necesario entrenar GeoVAE y la difusión desde cero con los recursos externos de Google Drive.
- Dependencias pesadas y fragiles: PyTorch Geometric con torch-scatter y torch-cluster, ViennaRNA, fr3d-python y fair-esm, con compilacion especifica por version de CUDA.
- Requiere pasos manuales propensos a error: ejecutar `notebooks/calc_static_latent.ipynb` para generar `vae_latent_stats.pt` y asegurar que `latent_dim` coincide entre GeoVAE y difusión.
- Licencia no declarada: no se puede confirmar el uso comercial; debe contactarse con los autores antes de cualquier explotacion.
- Sesgos y alucinacion: no aplica en el sentido linguistico, pero las secuencias generadas pueden ser inviables in vivo; los pesos de guia mitigan, no eliminan, colisiones estericas y violaciones de estructura secundaria.
- Cobertura limitada al dominio de estructuras de ARN presentes en los splits `gold_train.csv`, `gold_valid.csv` y `gold_test.csv`; el rendimiento fuera de esa distribucion no esta documentado.
- Sin datos de benchmarks publicados en la informacion disponible, no es posible verificar empiricamente la calidad frente a alternativas.
- El enlace al paper apunta a una pagina de NeurIPS 2026; conviene verificar su disponibilidad y revision por pares antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/dark00003/GOLD
- Paper (NeurIPS 2026): https://neurips.cc/virtual/2026/poster/153434
- Recursos (Google Drive): https://drive.google.com/file/d/1qkSxJWeXOLz2Z9X_5H9s_EEXSn-9v5rW/view?usp=drive_link
- Contacto: sqwd0616@gmail.com
