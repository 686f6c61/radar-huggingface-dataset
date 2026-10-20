# BlameOmar/zeta-2.1-oQ6e

## Resumen

zeta-2.1-oQ6e es un checkpoint cuantizado en formato MLX publicado por el usuario BlameOmar. No se trata de un modelo entrenado desde cero, sino de una recuantizacion de un modelo base denominado zeta-2.1, del que no se documentan arquitectura, datos de entrenamiento ni capacidades. El checkpoint contiene 8.250.462.208 parametros (8,25B) y ocupa 6,9 GB en el repositorio, con pesos safetensors y una media efectiva de 6,700 bits por peso.

La relevancia actual es practica: al reducir un modelo de 8,25B a unos 6,435 GiB de pesos, permite inferencia local en Apple Silicon con memoria unificada, usando la libreria MLX y el sistema de cuantizacion mixta oQ/oMLX v0.7.1. Sin embargo, la ficha no aporta licencia, idiomas, longitud de contexto, benchmarks ni descripcion del modelo base, por lo que cualquier evaluacion de calidad o uso en produccion exige pruebas adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; la etiqueta "llama" sugiere una arquitectura transformer decoder-only tipo Llama, sin confirmacion documental |
| Parametros totales | 8.250.462.208 (8,25B) |
| Parametros activos | no aplica; no se indica que sea MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 6-bit group 64 en el 90,007% de los pesos; affine 8-bit group 64 en el 9,990%; BF16 en el 0,003%; media efectiva 6,700 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantizado |
| Libreria | mlx |
| Tam
